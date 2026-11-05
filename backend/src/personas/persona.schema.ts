import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: false, versionKey: false, transform: (_, ret: any) => { ret.id = ret._id.toString(); delete ret._id; return ret; } } })
export class Persona extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ unique: true, sparse: true, trim: true })
  alias?: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, default: 'America/Argentina/Buenos_Aires' })
  zonaHoraria: string;

  @Prop({ unique: true, sparse: true })
  firebaseUid?: string;

  @Prop()
  proveedor?: string;

  @Prop()
  passwordHash?: string;

  @Prop()
  authToken?: string;
}

export const PersonaSchema = SchemaFactory.createForClass(Persona);
PersonaSchema.index({ alias: 1 }, { unique: true, sparse: true });
PersonaSchema.index({ email: 1 }, { unique: true });
PersonaSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
