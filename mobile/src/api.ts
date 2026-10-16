export type Categoria = 'SALUD' | 'ESTUDIO' | 'FINANZAS' | 'BIENESTAR' | 'OTRO';

export type EstadoDesafio = 'PROGRAMADO' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';

export type Desafio = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  inicio: string;
  fin: string;
  codigo: string;
  estado: EstadoDesafio;
  participantes: number;
  maxParticipantes: number;
};

export class ApiError extends Error {
  estado?: number;
  constructor(mensaje: string, estado?: number) {
    super(mensaje);
    this.estado = estado;
  }
}

const base = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://10.0.2.2:3000';

async function pedir<T>(ruta: string): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${base}${ruta}`);
  } catch {
    throw new ApiError('No hay conexion con el servidor. Revisa que el back este corriendo.');
  }
  if (!respuesta.ok) {
    if (respuesta.status >= 500) throw new ApiError('El servidor tuvo un problema. Probá de nuevo.', respuesta.status);
    throw new ApiError(`El servidor respondio ${respuesta.status}.`, respuesta.status);
  }
  return respuesta.json() as Promise<T>;
}

export async function traerDesafios(): Promise<Desafio[]> {
  return pedir<Desafio[]>('/desafios');
}

