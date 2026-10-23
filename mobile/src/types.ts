export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Persona = {
  id: string;
  nombre: string;
  alias: string;
  email: string;
  zonaHoraria: string;
};

export type Desafio = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  inicio: string;
  fin: string;
  maxParticipantes: number;
  codigo: string;
  creadorId: string;
  cancelado?: boolean;
  estado: string;
  participantes?: number;
};

export type Checkin = {
  id: string;
  desafioId: string;
  personaId: string;
  dia: string;
  nota: string;
  valor?: number;
  puntos: number;
  creadaEn?: string;
};

export type RankingItem = {
  personaId: string;
  alias: string;
  nombre: string;
  puntos: number;
  rachaActual: number;
  mejorRacha: number;
  posicion: number;
};

export type ResumenItem = {
  desafio: Desafio;
  rachaActual: number;
  mejorRacha: number;
  posicion: number | null;
  puntos: number;
  checkinHoy: boolean;
};

export type RachasInfo = {
  personaId: string;
  desafioId: string;
  rachaActual: number;
  mejorRacha: number;
  puntos: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type CrearPersonaDto = {
  nombre: string;
  alias: string;
  email: string;
  zonaHoraria?: string;
};

export type ActualizarPersonaDto = { nombre?: string; zonaHoraria?: string };

export type CrearDesafioDto = {
  nombre: string;
  descripcion?: string;
  categoria: string;
  inicio: string;
  fin: string;
  maxParticipantes?: number;
};

export type ActualizarDesafioDto = {
  nombre?: string;
  descripcion?: string;
  inicio?: string;
  fin?: string;
  maxParticipantes?: number;
};

export type CrearCheckinDto = {
  dia?: string;
  nota?: string;
  valor?: number;
};