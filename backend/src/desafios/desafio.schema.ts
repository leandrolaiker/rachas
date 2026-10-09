import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Desafio extends Document {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 60 })
  nombre: string;

  @Prop({ trim: true, maxlength: 280, default: '' })
  descripcion: string;

  @Prop({ required: true, enum: ['SALUD', 'ESTUDIO', 'FINANZAS', 'BIENESTAR', 'OTRO'] })
  categoria: string;

  @Prop({ required: true })
  inicio: Date;

  @Prop({ required: true })
  fin: Date;

  @Prop({ required: true, min: 2, max: 20, default: 10 })
  maxParticipantes: number;

  @Prop({ required: true, unique: true, length: 6 })
  codigo: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Persona' })
  creadorId: Types.ObjectId;

  @Prop({ default: false })
  cancelado: boolean;
}

export const DesafioSchema = SchemaFactory.createForClass(Desafio);
