import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private io: Server | null = null;

  setServer(io: Server) {
    this.io = io;
  }

  private room(desafioId: string) {
    return `desafio:${desafioId}`;
  }

  emit(desafioId: string, evento: string, data: any) {
    if (!this.io) return;
    this.io.to(this.room(desafioId)).emit(evento, { desafioId, ...data });
  }
}