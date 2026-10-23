import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Persona } from '../personas/persona.schema';
import { Desafio } from '../desafios/desafio.schema';
import { Participacion } from '../participaciones/participacion.schema';
import { hoyDia, sumarDias } from '../common/ayudas';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Persona.name) private personas: Model<Persona>,
    @InjectModel(Desafio.name) private desafios: Model<Desafio>,
    @InjectModel(Participacion.name) private partes: Model<Participacion>,
  ) {}

  async onModuleInit() {
    try {
      const cantidad = await this.personas.countDocuments().exec();
      if (cantidad > 0) return;
      const hoy = hoyDia();
      const gente = await this.personas.insertMany([
        { nombre: 'Lucia Fernandez', alias: 'luci_f', email: 'luci@mail.com', zonaHoraria: 'America/Argentina/Buenos_Aires' },
        { nombre: 'Martin Gomez', alias: 'martin_g', email: 'martin@mail.com', zonaHoraria: 'America/Argentina/Buenos_Aires' },
        { nombre: 'Sofia Ruiz', alias: 'sofi_r', email: 'sofi@mail.com', zonaHoraria: 'America/Argentina/Cordoba' },
      ]);
      const inicio = hoy;
      const fin = sumarDias(hoy, 20);
      const creados = await this.desafios.insertMany([
        {
          nombre: 'Correr 3 veces por semana',
          descripcion: 'Salimos a correr juntos y sumamos km',
          categoria: 'SALUD',
          inicio: new Date(inicio + 'T12:00:00.000Z'),
          fin: new Date(fin + 'T12:00:00.000Z'),
          maxParticipantes: 10,
          codigo: 'RUN123',
          creadorId: gente[0]._id,
          cancelado: false,
        },
        {
          nombre: 'Estudiar una hora por dia',
          descripcion: 'Hora de estudio sin celular',
          categoria: 'ESTUDIO',
          inicio: new Date(inicio + 'T12:00:00.000Z'),
          fin: new Date(fin + 'T12:00:00.000Z'),
          maxParticipantes: 8,
          codigo: 'STD456',
          creadorId: gente[1]._id,
          cancelado: false,
        },
      ]);
      await this.partes.insertMany([
        { desafioId: creados[0]._id, personaId: gente[0]._id, activa: true, fechaUnion: new Date() },
        { desafioId: creados[0]._id, personaId: gente[1]._id, activa: true, fechaUnion: new Date() },
        { desafioId: creados[1]._id, personaId: gente[1]._id, activa: true, fechaUnion: new Date() },
        { desafioId: creados[1]._id, personaId: gente[2]._id, activa: true, fechaUnion: new Date() },
      ]);
    } catch {
      return;
    }
  }
}
