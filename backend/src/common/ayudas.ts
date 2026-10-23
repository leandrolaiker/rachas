import moment from 'moment-timezone';

export function aDia(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export function hoyDia(): string {
  return new Date().toISOString().slice(0, 10);
}

export function hoyEnZona(zona: string): string {
  try {
    return moment().tz(zona || 'America/Argentina/Buenos_Aires').format('YYYY-MM-DD');
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
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

export function calcularEstadoEnZona(inicio: Date | string, fin: Date | string, cancelado: boolean, zona: string): EstadoDesafio {
  if (cancelado) return 'CANCELADO';
  const i = typeof inicio === 'string' ? inicio.slice(0, 10) : aDia(new Date(inicio));
  const f = typeof fin === 'string' ? fin.slice(0, 10) : aDia(new Date(fin));
  const hoy = hoyEnZona(zona);
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

export function calcularRachas(dias: string[], zona: string): { actual: number; mejor: number } {
  if (!dias || dias.length === 0) return { actual: 0, mejor: 0 };
  const ordenados = [...new Set(dias)].sort();
  const set = new Set(ordenados);
  let mejor = 1;
  let cur = 1;
  for (let i = 1; i < ordenados.length; i++) {
    if (ordenados[i] === sumarDias(ordenados[i - 1], 1)) {
      cur++;
      if (cur > mejor) mejor = cur;
    } else {
      cur = 1;
    }
  }
  const hoy = hoyEnZona(zona);
  const ayer = sumarDias(hoy, -1);
  let ancla: string | null = null;
  if (set.has(hoy)) ancla = hoy;
  else if (set.has(ayer)) ancla = ayer;
  let actual = 0;
  if (ancla) {
    let d = ancla;
    while (set.has(d)) {
      actual++;
      d = sumarDias(d, -1);
    }
  }
  return { actual, mejor: ordenados.length ? mejor : 0 };
}

export function rachaEnDia(dias: string[], dia: string): number {
  const set = new Set(dias);
  let r = 0;
  let d = dia;
  while (set.has(d)) {
    r++;
    d = sumarDias(d, -1);
  }
  return r;
}

export function bonusPorRacha(racha: number): number {
  if (racha >= 7) return 10;
  if (racha >= 3) return 5;
  return 0;
}
