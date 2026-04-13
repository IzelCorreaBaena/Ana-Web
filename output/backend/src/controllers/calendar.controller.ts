import { RequestHandler } from 'express';
import { EstadoReserva } from '@prisma/client';
import { prisma } from '../config/prisma';

export const calendarController = {
  availability: (async (req, res, next) => {
    try {
      const from = req.query.from ? new Date(String(req.query.from)) : new Date();
      const to = req.query.to
        ? new Date(String(req.query.to))
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      const reservas = await prisma.reserva.findMany({
        where: {
          fechaEvento: { gte: from, lte: to },
          estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.ACEPTADA] },
        },
        select: { id: true, fechaEvento: true, estado: true, servicioNombre: true },
      });

      res.json({ reservas });
    } catch (e) { next(e); }
  }) as RequestHandler,
};
