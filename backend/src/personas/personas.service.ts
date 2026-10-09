import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Persona } from './persona.schema';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';

function formatear(persona: any) {
  const obj = persona.toObject ? persona.toObject({ versionKey: false }) : { ...persona };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

@Injectable()
export class PersonasService {
  constructor(@InjectModel(Persona.name) private modelo: Model<Persona>) {}

  async crear(datos: CrearPersonaDto) {
    const alias = datos.alias.trim();
    if (!/^[A-Za-z0-9_]+$/.test(alias) || alias.length < 3 || alias.length > 20) {
      throw new BadRequestException('Alias invalido');
    }
    const email = datos.email.trim().toLowerCase();
    const repetido = await this.modelo.findOne({ $or: [{ alias }, { email }] }).exec();
    if (repetido) {
      if (repetido.alias === alias) throw new ConflictException('Ya existe una persona con ese alias');
      throw new ConflictException('Ya existe una persona con ese email');
    }
    try {
      const creada = await this.modelo.create({
        nombre: datos.nombre.trim(),
        alias,
        email: datos.email.trim().toLowerCase(),
        zonaHoraria: datos.zonaHoraria?.trim() || 'America/Argentina/Buenos_Aires',
      });
      return formatear(creada);
    } catch (error: any) {
      if (error?.code === 11000) {
        const campo = Object.keys(error.keyPattern || {})[0] || 'dato';
        throw new ConflictException(`Ya existe una persona con ese ${campo}`);
      }
      throw error;
    }
  }

  async listar() {
    const todas = await this.modelo.find().sort({ alias: 1 }).exec();
    return todas.map(formatear);
  }

  async buscarPorId(id: string) {
    let persona = null;
    try {
      persona = await this.modelo.findById(id).exec();
    } catch {
      throw new BadRequestException('Identificador invalido');
    }
    if (!persona) throw new NotFoundException('Persona no encontrada');
    return formatear(persona);
  }

  async actualizar(id: string, datos: ActualizarPersonaDto) {
    const persona = await this.modelo.findById(id).exec().catch(() => null);
    if (!persona) throw new NotFoundException('Persona no encontrada');
    if (datos.nombre !== undefined) persona.nombre = datos.nombre.trim();
    if (datos.zonaHoraria !== undefined) persona.zonaHoraria = datos.zonaHoraria.trim() || 'America/Argentina/Buenos_Aires';
    if (!persona.nombre) throw new BadRequestException('Nombre invalido');
    await persona.save();
    return formatear(persona);
  }
}
