import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Checkin } from './checkin.schema';
import { Desafio } from '../desafios/desafio.schema';
import { Persona } from '../personas/persona.schema';
import { Participacion } from '../participaciones/participacion.schema';
import { CrearCheckinDto } from './dto/crear-checkin.dto';
import { calcularEstado, formatearId, hoyDia, sumarDias } from '../common/ayudas';

@Injectable()
export class CheckinsService {
  constructor(
    @InjectModel(Checkin.name) private checkins: Model<Checkin>,
    @InjectModel(Desafio.name) private desafios: Model<Desafio>,
    @InjectModel(Persona.name) private personas: Model<Persona>,
    @InjectModel(Participacion.name) private partes: Model<Participacion>,
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

  async registrar(usuarioId: string, desafioId: string, datos: CrearCheckinDto) {
    const hoy = hoyDia();
    const ayer = sumarDias(hoy, -1);
    const dia = (datos.dia ?? hoy).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || Number.isNaN(new Date(dia + 'T12:00:00.000Z').getTime())) {
      throw new BadRequestException('Dia invalido');
    }
    const persona = await this.personaOr404(usuarioId);
    const desafio = await this.desafioOr404(desafioId);
    const parte = await this.partes.findOne({ desafioId: desafio._id, personaId: persona._id }).exec();
    if (!parte || !parte.activa) throw new ForbiddenException('Solo los participantes pueden registrar');
    const estado = calcularEstado(desafio.inicio, desafio.fin, desafio.cancelado);
    if (estado !== 'ACTIVO') throw new ConflictException('Solo se puede registrar en un desafio ACTIVO');
    if (dia !== hoy && dia !== ayer) throw new BadRequestException('Solo se puede registrar hoy o ayer');
    if (dia > hoy) throw new BadRequestException('No se puede registrar un dia futuro');
    const inicioDia = new Date(desafio.inicio).toISOString().slice(0, 10);
    const finDia = new Date(desafio.fin).toISOString().slice(0, 10);
    if (dia < inicioDia || dia > finDia) throw new ConflictException('El dia esta fuera del desafio');
    try {
      const creado = await this.checkins.create({
        desafioId: desafio._id,
        personaId: persona._id,
        dia,
        nota: (datos.nota ?? '').trim(),
        valor: datos.valor,
      });
      return formatearId(creado);
    } catch (error: any) {
      if (error?.code === 11000) throw new ConflictException('Ya registraste ese dia');
      throw error;
    }
  }

  async listar(desafioId: string, personaId: string) {
    const desafio = await this.desafioOr404(desafioId);
    if (!Types.ObjectId.isValid(personaId)) throw new BadRequestException('Identificador invalido');
    const persona = await this.personas.findById(personaId).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    const lista = await this.checkins.find({ desafioId: desafio._id, personaId: persona._id }).sort({ dia: 1 }).exec();
    return lista.map((c) => formatearId(c));
  }

  async deshacer(usuarioId: string, desafioId: string) {
    const persona = await this.personaOr404(usuarioId);
    const desafio = await this.desafioOr404(desafioId);
    const parte = await this.partes.findOne({ desafioId: desafio._id, personaId: persona._id }).exec();
    if (!parte || !parte.activa) throw new ForbiddenException('Solo los participantes pueden deshacer');
    const estado = calcularEstado(desafio.inicio, desafio.fin, desafio.cancelado);
    if (estado !== 'ACTIVO') throw new ConflictException('Solo se puede deshacer en un desafio ACTIVO');
    const ultimo = await this.checkins.findOne({ desafioId: desafio._id, personaId: persona._id }).sort({ dia: -1, creadaEn: -1 }).exec();
    if (!ultimo) throw new NotFoundException('No tenes check-ins para deshacer');
    if (ultimo.dia !== hoyDia()) throw new ConflictException('Solo se puede deshacer el check-in de hoy');
    await ultimo.deleteOne();
    return { ok: true };
  }
}
