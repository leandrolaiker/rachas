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
  estado: string;
  codigo: string;
  creadorId: string;
  maxParticipantes: number;
  participantes: number;
  ganador?: { personaId: string; alias: string; nombre: string; puntos: number; posicion: number };
};

export type Checkin = {
  id: string;
  desafioId: string;
  personaId: string;
  dia: string;
  nota: string;
  valor?: number;
  puntos: number;
};

export type RankingFila = {
  personaId: string;
  alias: string;
  nombre: string;
  puntos: number;
  rachaActual: number;
  mejorRacha: number;
  posicion: number;
};

export type Paginado<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type ResumenItem = Desafio & {
  rachaActual: number;
  posicion: number | null;
  hizoCheckinHoy: boolean;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
