import { leerSesion } from './session';
import { ApiError, Checkin, Desafio, Paginado, Persona, RankingFila, ResumenItem } from './types';

const base = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://10.0.2.2:3000';

async function pedir(ruta: string, opciones: RequestInit = {}) {
  const sesion = await leerSesion();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sesion) headers['x-usuario-id'] = sesion.id;
  if (opciones.headers) Object.assign(headers, opciones.headers as any);
  const res = await fetch(`${base}${ruta}`, { ...opciones, headers });
  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) mensaje = Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
    } catch {
      const texto = await res.text();
      if (texto) mensaje = texto;
    }
    throw new ApiError(res.status, mensaje);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function listarPersonas(): Promise<Persona[]> {
  return pedir('/personas');
}

export async function crearPersona(datos: { nombre: string; alias: string; email: string; zonaHoraria?: string }): Promise<Persona> {
  return pedir('/personas', { method: 'POST', body: JSON.stringify(datos) });
}

export async function obtenerPersona(id: string): Promise<Persona> {
  return pedir(`/personas/${id}`);
}

export async function actualizarPersona(id: string, datos: { nombre?: string; zonaHoraria?: string }): Promise<Persona> {
  return pedir(`/personas/${id}`, { method: 'PATCH', body: JSON.stringify(datos) });
}

export async function listarDesafios(filtros: { estado?: string; categoria?: string; personaId?: string; page?: number; limit?: number } = {}): Promise<Paginado<Desafio>> {
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.categoria) params.set('categoria', filtros.categoria);
  if (filtros.personaId) params.set('personaId', filtros.personaId);
  if (filtros.page) params.set('page', String(filtros.page));
  if (filtros.limit) params.set('limit', String(filtros.limit));
  const qs = params.toString();
  return pedir(`/desafios${qs ? '?' + qs : ''}`);
}

export async function desafiosDePersona(personaId: string): Promise<Desafio[]> {
  return pedir(`/desafios/persona/${personaId}`);
}

export async function obtenerDesafio(id: string): Promise<Desafio> {
  return pedir(`/desafios/${id}`);
}

export async function crearDesafio(datos: any): Promise<Desafio> {
  return pedir('/desafios', { method: 'POST', body: JSON.stringify(datos) });
}

export async function actualizarDesafio(id: string, datos: any): Promise<Desafio> {
  return pedir(`/desafios/${id}`, { method: 'PATCH', body: JSON.stringify(datos) });
}

export async function cancelarDesafio(id: string): Promise<Desafio> {
  return pedir(`/desafios/${id}/cancelar`, { method: 'POST' });
}

export async function unirseDesafio(codigo: string): Promise<Desafio> {
  return pedir('/desafios/unirse', { method: 'POST', body: JSON.stringify({ codigo }) });
}

export async function abandonarDesafio(id: string): Promise<{ ok: boolean }> {
  return pedir(`/desafios/${id}/participacion`, { method: 'DELETE' });
}

export async function participantesDesafio(id: string): Promise<Persona[]> {
  return pedir(`/desafios/${id}/participantes`);
}

export async function rankingDesafio(id: string): Promise<RankingFila[]> {
  return pedir(`/desafios/${id}/ranking`);
}

export async function resumenInicio(): Promise<ResumenItem[]> {
  return pedir('/desafios/resumen');
}

export async function registrarCheckin(desafioId: string, datos: { dia?: string; nota?: string; valor?: number }): Promise<Checkin> {
  return pedir(`/desafios/${desafioId}/checkins`, { method: 'POST', body: JSON.stringify(datos) });
}

export async function listarCheckins(desafioId: string, personaId: string, page = 1, limit = 20): Promise<Paginado<Checkin>> {
  return pedir(`/desafios/${desafioId}/checkins?personaId=${personaId}&page=${page}&limit=${limit}`);
}

export async function deshacerCheckin(desafioId: string): Promise<{ ok: boolean }> {
  return pedir(`/desafios/${desafioId}/checkins/ultimo`, { method: 'DELETE' });
}

export async function rachaPersona(desafioId: string, personaId: string): Promise<{ rachaActual: number; mejorRacha: number; puntos: number }> {
  return pedir(`/desafios/${desafioId}/checkins/racha?personaId=${personaId}`);
}
