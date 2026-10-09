import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: false, versionKey: false, transform: (_, ret: any) => { ret.id = ret._id.toString(); delete ret._id; return ret; } } })
export class Persona extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, unique: true, trim: true })
  alias: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, default: 'America/Argentina/Buenos_Aires' })
  zonaHoraria: string;
}

export const PersonaSchema = SchemaFactory.createForClass(Persona);
