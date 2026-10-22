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

export function rachaDeDias(dias: string[]): { actual: number; mejor: number } {
  const ordenados = [...new Set(dias)].sort();
  if (ordenados.length === 0) return { actual: 0, mejor: 0 };
  let mejor = 1;
  let corrida = 1;
  for (let i = 1; i < ordenados.length; i++) {
    if (sumarDias(ordenados[i - 1], 1) === ordenados[i]) {
      corrida++;
      if (corrida > mejor) mejor = corrida;
    } else {
      corrida = 1;
    }
  }
  const hoy = hoyDia();
  const ayer = sumarDias(hoy, -1);
  const set = new Set(ordenados);
  let actual = 0;
  let cursor = set.has(hoy) ? hoy : set.has(ayer) ? ayer : null;
  if (cursor) {
    while (set.has(cursor)) {
      actual++;
      cursor = sumarDias(cursor, -1);
    }
  }
  return { actual, mejor };
}
export function formatearId(doc: any) {
  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : { ...doc };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}
