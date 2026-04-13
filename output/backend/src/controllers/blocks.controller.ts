import { RequestHandler } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const bloqueSchema = z.object({
  titulo: z.string().min(1).max(150),
  descripcion: z.string().min(1),
  imagenes: z.array(z.string().url()).default([]),
  orden: z.number().int().optional(),
  activo: z.boolean().optional(),
  servicioId: z.string().uuid(),
});

export const blocksController = {
  list: (async (req, res, next) => {
    try {
      const servicioId = req.query.servicioId ? String(req.query.servicioId) : undefined;
      const bloques = await prisma.bloque.findMany({
        where: servicioId ? { servicioId } : undefined,
        orderBy: [{ servicioId: 'asc' }, { orden: 'asc' }],
      });
      res.json(bloques);
    } catch (e) { next(e); }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const bloque = await prisma.bloque.findUnique({ where: { id: req.params.id } });
      if (!bloque) throw new AppError('Bloque no encontrado', 404);
      res.json(bloque);
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = bloqueSchema.parse(req.body);
      const bloque = await prisma.bloque.create({ data });
      res.status(201).json(bloque);
    } catch (e) { next(e); }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const data = bloqueSchema.partial().parse(req.body);
      const bloque = await prisma.bloque.update({ where: { id: req.params.id }, data });
      res.json(bloque);
    } catch (e) { next(e); }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      await prisma.bloque.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
