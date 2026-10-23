import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Checkin extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Desafio' })
  desafioId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Persona' })
  personaId: Types.ObjectId;

  @Prop({ required: true })
  dia: string;

  @Prop({ maxlength: 140, default: '' })
  nota: string;

  @Prop()
  valor: number;

  @Prop({ default: 0 })
  puntos: number;

  @Prop({ default: Date.now })
  creadaEn: Date;
}

export const CheckinSchema = SchemaFactory.createForClass(Checkin);
CheckinSchema.index({ desafioId: 1, personaId: 1, dia: 1 }, { unique: true });
CheckinSchema.index({ desafioId: 1, personaId: 1, dia: -1 });
