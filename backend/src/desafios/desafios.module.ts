import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Desafio, DesafioSchema } from './desafio.schema';
import { Persona, PersonaSchema } from '../personas/persona.schema';
import { Participacion, ParticipacionSchema } from '../participaciones/participacion.schema';
import { DesafiosService } from './desafios.service';
import { DesafiosController } from './desafios.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Desafio.name, schema: DesafioSchema },
      { name: Persona.name, schema: PersonaSchema },
      { name: Participacion.name, schema: ParticipacionSchema },
    ]),
  ],
  controllers: [DesafiosController],
  providers: [DesafiosService],
  exports: [DesafiosService],
})
export class DesafiosModule {}
