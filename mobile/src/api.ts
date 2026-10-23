import * as T from './types';

const base = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://10.0.2.2:3000';

let usuarioId: string | null = null;
export function setUsuarioId(id: string | null) {
  usuarioId = id;
}
export function getUsuarioId() {
  return usuarioId;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(usuarioId ? { 'x-usuario-id': usuarioId } : {}),
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export const personasApi = {
  crear: (dto: T.CrearPersonaDto) => request('/personas', { method: 'POST', body: JSON.stringify(dto) }) as Promise<T.Persona>,
  listar: () => request('/personas') as Promise<T.Persona[]>,
  una: (id: string) => request(`/personas/${id}`) as Promise<T.Persona>,
  actualizar: (id: string, dto: T.ActualizarPersonaDto) => request(`/personas/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }) as Promise<T.Persona>,
  inicio: (id: string) => request(`/desafios/resumen/${id}`) as Promise<T.ResumenItem[]>,
};

export const desafiosApi = {
  crear: (dto: T.CrearDesafioDto) => request('/desafios', { method: 'POST', body: JSON.stringify(dto) }) as Promise<T.Desafio>,
  listar: (params: { estado?: string; categoria?: string; personaId?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.estado) q.set('estado', params.estado);
    if (params.categoria) q.set('categoria', params.categoria);
    if (params.personaId) q.set('personaId', params.personaId);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return request(`/desafios${qs ? '?' + qs : ''}`) as Promise<T.Paginated<T.Desafio>>;
  },
  uno: (id: string) => request(`/desafios/${id}`) as Promise<T.Desafio>,
  actualizar: (id: string, dto: T.ActualizarDesafioDto) => request(`/desafios/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }) as Promise<T.Desafio>,
  cancelar: (id: string) => request(`/desafios/${id}/cancelar`, { method: 'POST' }) as Promise<T.Desafio>,
  unirse: (codigo: string) => request('/desafios/unirse', { method: 'POST', body: JSON.stringify({ codigo }) }) as Promise<T.Desafio>,
  abandonar: (id: string) => request(`/desafios/${id}/participacion`, { method: 'DELETE' }) as Promise<{ ok: boolean }>,
  participantes: (id: string) => request(`/desafios/${id}/participantes`) as Promise<T.Persona[]>,
  ranking: (id: string) => request(`/desafios/${id}/ranking`) as Promise<T.RankingItem[]>,
  ganador: (id: string) => request(`/desafios/${id}/ganador`) as Promise<T.RankingItem | null>,
};

export const checkinsApi = {
  registrar: (desafioId: string, dto: T.CrearCheckinDto) => request(`/desafios/${desafioId}/checkins`, { method: 'POST', body: JSON.stringify(dto) }) as Promise<T.Checkin>,
  listar: (desafioId: string, personaId: string, page = 1, limit = 50) => request(`/desafios/${desafioId}/checkins?personaId=${personaId}&page=${page}&limit=${limit}`) as Promise<T.Paginated<T.Checkin>>,
  deshacer: (desafioId: string) => request(`/desafios/${desafioId}/checkins/ultimo`, { method: 'DELETE' }) as Promise<{ ok: boolean }>,
  rachas: (desafioId: string, personaId: string) => request(`/desafios/${desafioId}/checkins/racha/${personaId}`) as Promise<T.RachasInfo>,
};

export type * from './types';
