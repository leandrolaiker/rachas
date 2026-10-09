import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Participacion extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Desafio' })
  desafioId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Persona' })
  personaId: Types.ObjectId;

  @Prop({ default: true })
  activa: boolean;

  @Prop({ default: Date.now })
  fechaUnion: Date;

  @Prop()
  fechaAbandono: Date;
}

export const ParticipacionSchema = SchemaFactory.createForClass(Participacion);
ParticipacionSchema.index({ desafioId: 1, personaId: 1 }, { unique: true });
ParticipacionSchema.index({ personaId: 1, activa: 1 });
ParticipacionSchema.index({ desafioId: 1, activa: 1 });
