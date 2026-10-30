import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Persona, PersonaSchema } from '../personas/persona.schema';
import { Participacion, ParticipacionSchema } from '../participaciones/participacion.schema';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway } from './realtime.gateway';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Persona.name, schema: PersonaSchema },
      { name: Participacion.name, schema: ParticipacionSchema },
    ]),
  ],
  providers: [RealtimeService, RealtimeGateway],
  exports: [RealtimeService],
})
export class RealtimeModule {}