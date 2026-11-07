import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import type { Server } from 'socket.io';
import { Participacion } from '../participaciones/participacion.schema';

export const EMOJIS = ['👏', '💪', '🔥', '🎉', '❤️'] as const;

export interface Actor { id: string; nombre: string }

@Injectable()
export class RealtimeService {
  servidor?: Server;
  private readonly alientos = new Map<string, number>();

  constructor(@InjectModel(Participacion.name) private readonly participaciones: Model<Participacion>) {}

  setServer(io: Server) {
    this.servidor = io;
  }

  sala(id: string) { return `desafio:${id}`; }

  async exigirParticipante(desafio: string, persona: string) {
    if (!isValidObjectId(desafio) || !isValidObjectId(persona))
      throw new ForbiddenException('El desafío o la persona no son válidos');
    const activa = await this.participaciones.exists({ desafio, persona, activa: true });
    if (!activa) throw new ForbiddenException('Solo los participantes activos pueden entrar a esta sala');
  }

  emit(desafioId: string, evento: string, data: any) {
    if (!this.servidor) return;
    this.servidor.to(this.sala(desafioId)).emit(evento, { desafioId, ...data });
  }

  async alentar(desafioId: string, actor: Actor, destinatarioId: string, emoji: string) {
    await this.exigirParticipante(desafioId, actor.id);
    if (destinatarioId === actor.id) throw new ForbiddenException('No podés enviarte aliento a vos mismo');
    await this.exigirParticipante(desafioId, destinatarioId);
    if (!(EMOJIS as readonly string[]).includes(emoji)) throw new ForbiddenException('Elegí una reacción permitida');
    const ahora = Date.now();
    for (const [clave, hasta] of this.alientos) if (hasta <= ahora) this.alientos.delete(clave);
    const clave = `${actor.id}:${desafioId}`;
    const restante = (this.alientos.get(clave) ?? 0) - ahora;
    if (restante > 0) return { ok: false as const, error: { codigo: 'LIMITE_ALIENTO', mensaje: 'Esperá diez segundos entre alientos', reintentarEn: Math.ceil(restante / 1000) } };
    this.alientos.set(clave, ahora + 10_000);
    this.servidor?.to(this.sala(desafioId)).emit('aliento.recibido', {
      desafioId, actor, destinatarioId, emoji, fecha: new Date(ahora).toISOString(),
    });
    return { ok: true as const };
  }
}