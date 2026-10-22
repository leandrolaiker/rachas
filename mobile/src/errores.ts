import { ApiError } from './types';

export function mensajeError(e: any): string {
  if (e instanceof ApiError) {
    if (e.status === 409) {
      if (/lleno|cupo/i.test(e.message)) return 'El desafio esta lleno, no hay cupo.';
      if (/vigentes/i.test(e.message)) return 'Ya tienes 5 desafios vigentes.';
      if (/Ya participas/i.test(e.message)) return 'Ya participas en este desafio.';
      if (/Abandonaste/i.test(e.message)) return 'Abandonaste este desafio y no puedes volver.';
      if (/repetid|alias|email/i.test(e.message)) return 'Ese alias o email ya esta en uso.';
      return e.message;
    }
    if (e.status === 404) return 'No se encontro lo que buscabas.';
    if (e.status === 403) return 'No tienes permiso para hacer eso.';
    if (e.status === 400) return e.message || 'Datos invalidos.';
    if (e.status === 401) return 'Tu sesion vencio, vuelve a ingresar.';
    return e.message || 'Algo salio mal.';
  }
  if (e?.message?.toLowerCase?.().includes('network')) return 'Sin conexion. Revisa tu red.';
  return 'No se pudo conectar con el servidor.';
}
