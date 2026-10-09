export type Desafio = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  inicio: string;
  fin: string;
  codigo: string;
  estado: string;
  participantes: number;
  maxParticipantes: number;
};

const base = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://10.0.2.2:3000';

async function pedir(ruta: string) {
  const respuesta = await fetch(`${base}${ruta}`);
  if (!respuesta.ok) {
    throw new Error(`El servidor respondio ${respuesta.status}`);
  }
  return respuesta.json();
}

export async function traerDesafios(): Promise<Desafio[]> {
  return pedir('/desafios');
}
