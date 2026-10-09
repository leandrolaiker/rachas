export function aDia(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export function hoyDia(): string {
  return new Date().toISOString().slice(0, 10);
}

export function sumarDias(dia: string, dias: number): string {
  const base = new Date(dia + 'T12:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

export function diferenciaDias(inicio: string, fin: string): number {
  const a = new Date(inicio + 'T12:00:00.000Z').getTime();
  const b = new Date(fin + 'T12:00:00.000Z').getTime();
  return Math.round((b - a) / 86400000) + 1;
}

export type EstadoDesafio = 'PROGRAMADO' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';

export function calcularEstado(inicio: Date | string, fin: Date | string, cancelado: boolean): EstadoDesafio {
  if (cancelado) return 'CANCELADO';
  const i = typeof inicio === 'string' ? inicio.slice(0, 10) : aDia(new Date(inicio));
  const f = typeof fin === 'string' ? fin.slice(0, 10) : aDia(new Date(fin));
  const hoy = hoyDia();
  if (hoy < i) return 'PROGRAMADO';
  if (hoy > f) return 'FINALIZADO';
  return 'ACTIVO';
}

export function formatearId(doc: any) {
  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : { ...doc };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}
