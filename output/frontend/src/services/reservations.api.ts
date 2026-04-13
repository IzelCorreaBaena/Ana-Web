import { http } from './http';
import type {
  Reserva,
  CreateReservaPayload,
  UpdateReservaPayload,
  EstadoReserva,
} from '@types/models';

export const reservationsApi = {
  async list(): Promise<Reserva[]> {
    const { data } = await http.get<Reserva[]>('/reservations');
    return data;
  },

  async getOne(id: string): Promise<Reserva> {
    const { data } = await http.get<Reserva>(`/reservations/${id}`);
    return data;
  },

  /**
   * Public endpoint — no auth token required.
   * Payload field names must match the backend Zod schema exactly.
   */
  async create(payload: CreateReservaPayload): Promise<Reserva> {
    const { data } = await http.post<Reserva>('/reservations', payload);
    return data;
  },

  /**
   * Admin endpoint — updates estado and optional notas.
   * Uses PUT to match the backend route (router.put('/:id', ...)).
   */
  async updateEstado(
    id: string,
    estado: Exclude<EstadoReserva, 'PENDIENTE'>,
    notas?: string,
  ): Promise<Reserva> {
    const payload: UpdateReservaPayload = { estado, ...(notas !== undefined && { notas }) };
    const { data } = await http.put<Reserva>(`/reservations/${id}`, payload);
    return data;
  },

  /**
   * Generic update — accepts any partial UpdateReservaPayload.
   * Kept for backward compatibility with Admin/Reservations.tsx.
   */
  async update(id: string, payload: UpdateReservaPayload): Promise<Reserva> {
    const { data } = await http.put<Reserva>(`/reservations/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/reservations/${id}`);
  },
};
