import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Persona, PersonaSchema } from './persona.schema';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Persona.name, schema: PersonaSchema }])],
  controllers: [PersonasController],
  providers: [PersonasService],
  exports: [PersonasService, MongooseModule],
})
export class PersonasModule {}
