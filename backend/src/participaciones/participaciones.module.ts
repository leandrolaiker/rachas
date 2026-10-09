import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Participacion, ParticipacionSchema } from './participacion.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Participacion.name, schema: ParticipacionSchema }])],
  exports: [MongooseModule],
})
export class ParticipacionesModule {}
