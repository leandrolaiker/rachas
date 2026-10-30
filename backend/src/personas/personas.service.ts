import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Persona } from './persona.schema';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificarPasswordHash(password: string, stored: string): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calc, 'hex'), Buffer.from(hash, 'hex'));
}

function generarToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function zonaValida(zona: string): boolean {
  return /^[A-Za-z]+\/[A-Za-z_+-]+(\/[A-Za-z_+-]+)*$/.test(zona);
}

function formatear(persona: any) {
  const obj = persona.toObject ? persona.toObject({ versionKey: false }) : { ...persona };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.authToken;
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
    const zona = datos.zonaHoraria?.trim() || 'America/Argentina/Buenos_Aires';
    if (!zonaValida(zona)) throw new BadRequestException('Zona horaria invalida');
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
        zonaHoraria: zona,
        passwordHash: hashPassword(datos.password),
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
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Identificador invalido');
    const persona = await this.modelo.findById(id).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    return formatear(persona);
  }

  async actualizar(id: string, datos: ActualizarPersonaDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Identificador invalido');
    const persona = await this.modelo.findById(id).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    if (datos.nombre !== undefined) {
      if (!datos.nombre.trim()) throw new BadRequestException('Nombre invalido');
      persona.nombre = datos.nombre.trim();
    }
    if (datos.zonaHoraria !== undefined) {
      const zona = datos.zonaHoraria.trim() || 'America/Argentina/Buenos_Aires';
      if (!zonaValida(zona)) throw new BadRequestException('Zona horaria invalida');
      persona.zonaHoraria = zona;
    }
    if (datos.password !== undefined) {
      persona.passwordHash = hashPassword(datos.password);
    }
    await persona.save();
    return formatear(persona);
  }

  async buscarPorAliasOEmail(identificador: string) {
    const valor = identificador.trim().toLowerCase();
    return this.modelo.findOne({ $or: [{ alias: identificador.trim() }, { email: valor }] }).exec();
  }

  async verificarPassword(id: string, password: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const persona = await this.modelo.findById(id).exec();
    if (!persona) return false;
    return verificarPasswordHash(password, (persona as any).passwordHash);
  }

  async iniciarSesion(id: string): Promise<string> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Identificador invalido');
    const persona = await this.modelo.findById(id).exec();
    if (!persona) throw new NotFoundException('Persona no encontrada');
    const token = generarToken();
    (persona as any).authToken = token;
    await persona.save();
    return token;
  }

  async buscarPorToken(token: string) {
    if (!token) return null;
    const persona = await this.modelo.findOne({ authToken: token }).exec();
    if (!persona) return null;
    return formatear(persona);
  }

  async cerrarSesion(token: string) {
    const persona = await this.modelo.findOne({ authToken: token }).exec();
    if (persona) {
      (persona as any).authToken = undefined;
      await persona.save();
    }
    return { ok: true };
  }
}
