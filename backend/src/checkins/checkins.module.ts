import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Checkin, CheckinSchema } from './checkin.schema';
import { Desafio, DesafioSchema } from '../desafios/desafio.schema';
import { Persona, PersonaSchema } from '../personas/persona.schema';
import { Participacion, ParticipacionSchema } from '../participaciones/participacion.schema';
import { CheckinsService } from './checkins.service';
import { CheckinsController } from './checkins.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Checkin.name, schema: CheckinSchema },
      { name: Desafio.name, schema: DesafioSchema },
      { name: Persona.name, schema: PersonaSchema },
      { name: Participacion.name, schema: ParticipacionSchema },
    ]),
  ],
  controllers: [CheckinsController],
  providers: [CheckinsService],
})
export class CheckinsModule {}
