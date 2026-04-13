import { RequestHandler } from 'express';
import { z } from 'zod';
import { EstadoReserva } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/email.service';
import { calendarService } from '../services/calendar.service';

// Phone: digits, spaces, dashes, parentheses, leading +. Length 6–25.
const phoneRegex = /^[+]?[\d\s\-().]{6,25}$/;

const reservaSchema = z.object({
  nombre: z.string().trim().min(1).max(150),
  telefono: z
    .string()
    .trim()
    .min(6)
    .max(25)
    .regex(phoneRegex, 'Teléfono con formato inválido'),
  email: z.string().trim().toLowerCase().email().max(254),
  mensaje: z.string().trim().min(1).max(2000),
  fechaEvento: z
    .string()
    .datetime()
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: 'La fecha del evento debe estar en el futuro',
    })
    .optional(),
  servicioId: z.string().uuid().optional(),
});

const updateSchema = z.object({
  estado: z.nativeEnum(EstadoReserva).optional(),
  notas: z.string().max(2000).optional(),
  fechaEvento: z.string().datetime().optional(),
  googleEventId: z.string().max(255).optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });
const listQuerySchema = z.object({ estado: z.nativeEnum(EstadoReserva).optional() });

export const reservationsController = {
  list: (async (req, res, next) => {
    try {
      const { estado } = listQuerySchema.parse(req.query);
      const reservas = await prisma.reserva.findMany({
        where: estado ? { estado } : undefined,
        include: { servicio: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json(reservas);
    } catch (e) { next(e); }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const reserva = await prisma.reserva.findUnique({
        where: { id },
        include: { servicio: true },
      });
      if (!reserva) throw new AppError('Reserva no encontrada', 404);
      res.json(reserva);
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = reservaSchema.parse(req.body);

      // Snapshot del nombre del servicio para preservar historial
      let servicioNombre: string | undefined;
      if (data.servicioId) {
        const servicio = await prisma.servicio.findUnique({ where: { id: data.servicioId } });
        if (!servicio) throw new AppError('Servicio no encontrado', 404);
        servicioNombre = servicio.titulo;
      }

      const reserva = await prisma.reserva.create({
        data: {
          ...data,
          fechaEvento: data.fechaEvento ? new Date(data.fechaEvento) : null,
          servicioNombre,
          estado: EstadoReserva.PENDIENTE,
        },
      });

      emailService.sendReservationConfirmation(reserva).catch((err) => {
        console.error('[email] failed to send confirmation', err);
      });

      res.status(201).json(reserva);
    } catch (e) { next(e); }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateSchema.parse(req.body);
      const reserva = await prisma.reserva.update({
        where: { id },
        data: {
          ...data,
          fechaEvento: data.fechaEvento ? new Date(data.fechaEvento) : undefined,
        },
        include: { servicio: true },
      });

      // Fire-and-forget side effects on estado transitions
      if (data.estado === EstadoReserva.ACEPTADA) {
        emailService.sendAcceptedEmail(reserva).catch((err) => {
          console.error('[email] failed to send accepted notification', err);
        });

        // Attempt Google Calendar event creation and persist the event ID if successful
        calendarService.createEvent(reserva).then(async (eventId) => {
          if (eventId) {
            await prisma.reserva.update({
              where: { id: reserva.id },
              data: { googleEventId: eventId },
            }).catch((err) => {
              console.error('[calendar] failed to persist googleEventId', err);
            });
          }
        }).catch((err) => {
          console.error('[calendar] createEvent threw unexpectedly', err);
        });
      } else if (data.estado === EstadoReserva.RECHAZADA) {
        emailService.sendRejectedEmail(reserva, data.notas).catch((err) => {
          console.error('[email] failed to send rejected notification', err);
        });
      }

      res.json(reserva);
    } catch (e) { next(e); }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await prisma.reserva.delete({ where: { id } });
      res.status(204).send();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
