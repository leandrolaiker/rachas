import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Desafio } from './desafio.schema';
import { Persona } from '../personas/persona.schema';
import { Participacion } from '../participaciones/participacion.schema';
import { Checkin } from '../checkins/checkin.schema';
import { CrearDesafioDto } from './dto/crear-desafio.dto';
import { aDia, calcularEstado, diferenciaDias, formatearId, hoyDia, hoyEnZona, calcularRachas } from '../common/ayudas';

function codigoNuevo(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  return codigo;
}

function presentar(desafio: any, cantidad?: number) {
  const obj = formatearId(desafio);
  obj.inicio = aDia(new Date(obj.inicio));
  obj.fin = aDia(new Date(obj.fin));
  obj.estado = calcularEstado(obj.inicio, obj.fin, !!obj.cancelado);
  obj.creadorId = obj.creadorId.toString();
  if (cantidad !== undefined) obj.participantes = cantidad;
  return obj;
}

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel(Desafio.name) private desafios: Model<Desafio>,
    @InjectModel(Persona.name) private personas: Model<Persona>,
    @InjectModel(Participacion.name) private partes: Model<Participacion>,
    @InjectModel(Checkin.name) private checkins: Model<Checkin>,
  ) {}

  private async personaOr404(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) throw new BadRequestException('Encabezado x-usuario-id invalido');
    const persona = await this.personas.findById(id).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    return persona;
  }

  private async desafioOr404(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Identificador invalido');
    const desafio = await this.desafios.findById(id).exec();
    if (!desafio) throw new NotFoundException('Desafio no encontrado');
    return desafio;
  }

  private async vigentesDe(personaId: string): Promise<number> {
    const lista = await this.partes.find({ personaId: new Types.ObjectId(personaId), activa: true }).exec();
    if (lista.length === 0) return 0;
    const ids = lista.map((p) => p.desafioId);
    const desafios = await this.desafios.find({ _id: { $in: ids } }).exec();
    let cantidad = 0;
    for (const d of desafios) {
      const estado = calcularEstado(d.inicio, d.fin, d.cancelado);
      if (estado === 'PROGRAMADO' || estado === 'ACTIVO') cantidad++;
    }
    return cantidad;
  }

  async crear(usuarioId: string, datos: CrearDesafioDto) {
    const creador = await this.personaOr404(usuarioId);
    const inicioDia = datos.inicio.slice(0, 10);
    const finDia = datos.fin.slice(0, 10);
    if (finDia < inicioDia) throw new BadRequestException('La fecha de fin es anterior al inicio');
    if (inicioDia < hoyDia()) throw new BadRequestException('El desafio no puede empezar en el pasado');
    const duracion = diferenciaDias(inicioDia, finDia);
    if (duracion < 3 || duracion > 90) throw new BadRequestException('La duracion debe ser de 3 a 90 dias');
    const vigentes = await this.vigentesDe(creador._id.toString());
    if (vigentes >= 5) throw new ConflictException('No podes tener mas de 5 desafios vigentes');
    let codigo = codigoNuevo();
    for (let i = 0; i < 5; i++) {
      const existe = await this.desafios.findOne({ codigo }).exec();
      if (!existe) break;
      codigo = codigoNuevo();
    }
    const desafio = await this.desafios.create({
      nombre: datos.nombre.trim(),
      descripcion: (datos.descripcion ?? '').trim(),
      categoria: datos.categoria,
      inicio: new Date(inicioDia + 'T12:00:00.000Z'),
      fin: new Date(finDia + 'T12:00:00.000Z'),
      maxParticipantes: datos.maxParticipantes ?? 10,
      codigo,
      creadorId: creador._id,
      cancelado: false,
    });
    await this.partes.create({ desafioId: desafio._id, personaId: creador._id, activa: true, fechaUnion: new Date() });
    return presentar(desafio, 1);
  }

  async listar(filtros: { estado?: string; categoria?: string; personaId?: string; page?: number; limit?: number }) {
    let query: any = {};
    if (filtros.categoria) query.categoria = filtros.categoria;
    const todos = await this.desafios.find(query).sort({ inicio: 1 }).exec();
    let salida = [] as any[];
    for (const d of todos) {
      const cantidad = await this.partes.countDocuments({ desafioId: d._id, activa: true }).exec();
      salida.push(presentar(d, cantidad));
    }
    if (filtros.estado) salida = salida.filter((d) => d.estado === filtros.estado);
    if (filtros.personaId) {
      if (!Types.ObjectId.isValid(filtros.personaId)) throw new BadRequestException('Identificador de persona invalido');
      const lista = await this.partes.find({ personaId: new Types.ObjectId(filtros.personaId), activa: true }).exec();
      const ids = new Set(lista.map((p) => p.desafioId.toString()));
      salida = salida.filter((d) => ids.has(d.id));
    }
    const page = Math.max(1, filtros.page || 1);
    const limit = Math.max(1, filtros.limit || 20);
    const total = salida.length;
    const skip = (page - 1) * limit;
    const items = salida.slice(skip, skip + limit);
    return { items, total, page, limit };
  }

  async desafiosDePersona(personaId: string) {
    if (!Types.ObjectId.isValid(personaId)) throw new BadRequestException('Identificador invalido');
    const persona = await this.personas.findById(personaId).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    const lista = await this.partes.find({ personaId: new Types.ObjectId(personaId), activa: true }).exec();
    if (lista.length === 0) return [];
    const ids = lista.map((p) => p.desafioId);
    const desafios = await this.desafios.find({ _id: { $in: ids } }).sort({ inicio: 1 }).exec();
    const salida = [] as any[];
    for (const d of desafios) {
      const cantidad = await this.partes.countDocuments({ desafioId: d._id, activa: true }).exec();
      salida.push(presentar(d, cantidad));
    }
    return salida;
  }

  async uno(id: string) {
    const desafio = await this.desafioOr404(id);
    const cantidad = await this.partes.countDocuments({ desafioId: desafio._id, activa: true }).exec();
    return presentar(desafio, cantidad);
  }

  async actualizar(usuarioId: string, id: string, datos: any) {
    const actor = await this.personaOr404(usuarioId);
    const desafio = await this.desafioOr404(id);
    if (desafio.creadorId.toString() !== actor._id.toString()) throw new ForbiddenException('Solo el creador puede modificarlo');
    const estado = calcularEstado(desafio.inicio, desafio.fin, desafio.cancelado);
    if (estado === 'FINALIZADO' || estado === 'CANCELADO') throw new ConflictException('El desafio ya esta cerrado');
    if (datos.nombre !== undefined) desafio.nombre = datos.nombre.trim();
    if (datos.descripcion !== undefined) desafio.descripcion = (datos.descripcion ?? '').trim();
    if (datos.inicio !== undefined || datos.fin !== undefined || datos.maxParticipantes !== undefined) {
      if (estado !== 'PROGRAMADO') throw new ConflictException('Solo se pueden cambiar fechas y cupo en PROGRAMADO');
      const nuevoInicio = ((datos.inicio ?? aDia(desafio.inicio)) as string).slice(0, 10);
      const nuevoFin = ((datos.fin ?? aDia(desafio.fin)) as string).slice(0, 10);
      if (nuevoFin < nuevoInicio) throw new BadRequestException('La fecha de fin es anterior al inicio');
      if (nuevoInicio < hoyDia()) throw new BadRequestException('El desafio no puede empezar en el pasado');
      const duracion = diferenciaDias(nuevoInicio, nuevoFin);
      if (duracion < 3 || duracion > 90) throw new BadRequestException('La duracion debe ser de 3 a 90 dias');
      desafio.inicio = new Date(nuevoInicio + 'T12:00:00.000Z');
      desafio.fin = new Date(nuevoFin + 'T12:00:00.000Z');
      if (datos.maxParticipantes !== undefined) {
        const cantidad = await this.partes.countDocuments({ desafioId: desafio._id, activa: true }).exec();
        if (datos.maxParticipantes < cantidad) throw new ConflictException('El cupo no puede quedar debajo de los participantes');
        desafio.maxParticipantes = datos.maxParticipantes;
      }
    }
    await desafio.save();
    const cantidad = await this.partes.countDocuments({ desafioId: desafio._id, activa: true }).exec();
    return presentar(desafio, cantidad);
  }

  async cancelar(usuarioId: string, id: string) {
    const actor = await this.personaOr404(usuarioId);
    const desafio = await this.desafioOr404(id);
    if (desafio.creadorId.toString() !== actor._id.toString()) throw new ForbiddenException('Solo el creador puede cancelarlo');
    const estado = calcularEstado(desafio.inicio, desafio.fin, desafio.cancelado);
    if (estado !== 'PROGRAMADO' && estado !== 'ACTIVO') throw new ConflictException('Solo se puede cancelar en PROGRAMADO o ACTIVO');
    desafio.cancelado = true;
    await desafio.save();
    const cantidad = await this.partes.countDocuments({ desafioId: desafio._id, activa: true }).exec();
    return presentar(desafio, cantidad);
  }

  async unirse(usuarioId: string, codigo: string) {
    const persona = await this.personaOr404(usuarioId);
    if (!codigo) throw new BadRequestException('Falta el codigo de invitacion');
    const desafio = await this.desafios.findOne({ codigo: codigo.trim().toUpperCase() }).exec();
    if (!desafio) throw new NotFoundException('Desafio no encontrado');
    const estado = calcularEstado(desafio.inicio, desafio.fin, desafio.cancelado);
    if (estado !== 'PROGRAMADO' && estado !== 'ACTIVO') throw new ConflictException('El desafio no acepta participantes');
    const existente = await this.partes.findOne({ desafioId: desafio._id, personaId: persona._id }).exec();
    if (existente) {
      if (existente.activa) throw new ConflictException('Ya participas en este desafio');
      throw new ConflictException('Abandonaste este desafio y no podes volver');
    }
    const cantidad = await this.partes.countDocuments({ desafioId: desafio._id, activa: true }).exec();
    if (cantidad >= desafio.maxParticipantes) throw new ConflictException('El desafio esta lleno');
    const vigentes = await this.vigentesDe(persona._id.toString());
    if (vigentes >= 5) throw new ConflictException('No podes tener mas de 5 desafios vigentes');
    await this.partes.create({ desafioId: desafio._id, personaId: persona._id, activa: true, fechaUnion: new Date() });
    return presentar(desafio, cantidad + 1);
  }

  async abandonar(usuarioId: string, id: string) {
    const persona = await this.personaOr404(usuarioId);
    const desafio = await this.desafioOr404(id);
    if (desafio.creadorId.toString() === persona._id.toString()) throw new ForbiddenException('El creador tiene que cancelarlo');
    const parte = await this.partes.findOne({ desafioId: desafio._id, personaId: persona._id }).exec();
    if (!parte || !parte.activa) throw new NotFoundException('No participas en este desafio');
    parte.activa = false;
    parte.fechaAbandono = new Date();
    await parte.save();
    return { ok: true };
  }

  async ranking(desafioId: string) {
    const desafio = await this.desafioOr404(desafioId);
    const partes = await this.partes.find({ desafioId: desafio._id, activa: true }).exec();
    const ids = partes.map((p) => p.personaId);
    const personas = await this.personas.find({ _id: { $in: ids } }).exec();
    const personaMap = new Map(personas.map((p) => [p._id.toString(), p]));
    const filas: any[] = [];
    for (const parte of partes) {
      const pid = parte.personaId.toString();
      const persona: any = personaMap.get(pid);
      const checkins = await this.checkins.find({ desafioId: desafio._id, personaId: parte.personaId }).exec();
      const dias = checkins.map((c: any) => c.dia);
      const zona = persona?.zonaHoraria || 'America/Argentina/Buenos_Aires';
      const r = calcularRachas(dias, zona);
      const puntos = checkins.reduce((a: number, c: any) => a + (c.puntos || 0), 0);
      filas.push({ personaId: pid, alias: persona?.alias, nombre: persona?.nombre, puntos, rachaActual: r.actual, mejorRacha: r.mejor });
    }
    filas.sort((a, b) => b.puntos - a.puntos || b.rachaActual - a.rachaActual || String(a.alias).localeCompare(String(b.alias)));
    return filas.map((f, i) => ({ ...f, posicion: i + 1 }));
  }

  async resumenPersona(personaId: string) {
    if (!Types.ObjectId.isValid(personaId)) throw new BadRequestException('Identificador invalido');
    const persona = await this.personas.findById(personaId).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    const partes = await this.partes.find({ personaId: persona._id, activa: true }).exec();
    const ids = partes.map((p) => p.desafioId);
    const desafios = await this.desafios.find({ _id: { $in: ids } }).exec();
    const zona = persona.zonaHoraria || 'America/Argentina/Buenos_Aires';
    const hoy = hoyEnZona(zona);
    const salida: any[] = [];
    for (const d of desafios) {
      const estado = calcularEstado(d.inicio, d.fin, d.cancelado);
      if (estado !== 'PROGRAMADO' && estado !== 'ACTIVO') continue;
      const checkins = await this.checkins.find({ desafioId: d._id, personaId: persona._id }).exec();
      const dias = checkins.map((c: any) => c.dia);
      const r = calcularRachas(dias, zona);
      const ranking = await this.ranking(d._id.toString());
      const fila = ranking.find((x: any) => x.personaId === persona._id.toString());
      const checkinHoy = checkins.some((c: any) => c.dia === hoy);
      salida.push({
        desafio: presentar(d, await this.partes.countDocuments({ desafioId: d._id, activa: true }).exec()),
        rachaActual: r.actual,
        mejorRacha: r.mejor,
        posicion: fila ? fila.posicion : null,
        puntos: fila ? fila.puntos : 0,
        checkinHoy,
      });
    }
    return salida;
  }

  async participantes(id: string) {
    const desafio = await this.desafioOr404(id);
    const lista = await this.partes.find({ desafioId: desafio._id, activa: true }).exec();
    const ids = lista.map((p) => p.personaId);
    if (ids.length === 0) return [];
    const personas = await this.personas.find({ _id: { $in: ids } }).exec();
    return personas.map((p) => formatearId(p));
  }

  async ganador(desafioId: string) {
    const ranking = await this.ranking(desafioId);
    return ranking.length ? ranking[0] : null;
  }
}
