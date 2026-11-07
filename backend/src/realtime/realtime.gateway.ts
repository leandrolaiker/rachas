import { OnGatewayInit, WebSocketGateway, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { BadRequestException, HttpException, UnauthorizedException } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { TokenService } from '../auth/token.service';
import { PersonaAuthService } from '../auth/persona-auth.service';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({ maxHttpBufferSize: 4096, cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayInit {
  constructor(
    private readonly tokens: TokenService,
    private readonly personas: PersonaAuthService,
    private readonly realtime: RealtimeService,
  ) {}

  afterInit(servidor: Server) {
    this.realtime.setServer(servidor);
    servidor.use(async (socket, next) => {
      try {
        const token: unknown = socket.handshake.auth.token;
        const identidad = await this.tokens.verificar(token);
        const persona = await this.personas.resolver(identidad, String(token));
        if (!persona.alias) throw new UnauthorizedException('Completá tu alias antes de conectar');
        socket.data.personaId = String(persona._id);
        socket.data.nombre = persona.nombre;
        socket.data.expira = identidad.expira;
        next();
      } catch (e) {
        const autorizado = e instanceof UnauthorizedException;
        next(Object.assign(new Error(autorizado ? 'La sesión venció o no es válida' : 'No se pudo conectar. Volvé a intentar'),
          { data: { codigo: autorizado ? 'NO_AUTORIZADO' : 'SERVICIO_NO_DISPONIBLE' } }));
      }
    });
    servidor.on('connection', socket => {
      const duracion = Math.max(0, socket.data.expira * 1000 - Date.now());
      const timer = setTimeout(() => {
        socket.emit('sesion.vencida');
        socket.disconnect(true);
      }, Math.min(duracion, 2_147_483_647));
      socket.once('disconnect', () => clearTimeout(timer));
    });
  }

  private datos(socket: Socket, entrada: unknown): Record<string, unknown> {
    if (socket.data.expira * 1000 <= Date.now()) throw new UnauthorizedException('La sesión venció. Volvé a ingresar');
    if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) throw new BadRequestException('El mensaje no es válido');
    return entrada as Record<string, unknown>;
  }

  private error(e: unknown) {
    return { ok: false as const, error: { codigo: 'OPERACION_RECHAZADA', mensaje: e instanceof HttpException ? e.message : 'No se pudo completar la operación. Volvé a intentar' } };
  }

  @SubscribeMessage('unirse_desafio')
  async handleJoin(@ConnectedSocket() socket: Socket, @MessageBody() entrada: unknown) {
    try {
      const datos = this.datos(socket, entrada);
      if (typeof datos.desafioId !== 'string') throw new BadRequestException('Indicá el desafío');
      await socket.join(`desafio:${datos.desafioId}`);
      socket.emit('suscripto', { desafioId: datos.desafioId });
      return { ok: true };
    } catch (e) {
      return this.error(e);
    }
  }

  @SubscribeMessage('salir_desafio')
  async handleLeave(@ConnectedSocket() socket: Socket, @MessageBody() entrada: unknown) {
    try {
      const datos = this.datos(socket, entrada);
      if (typeof datos.desafioId === 'string') await socket.leave(`desafio:${datos.desafioId}`);
      return { ok: true };
    } catch (e) {
      return this.error(e);
    }
  }

  @SubscribeMessage('aliento')
  async handleAliento(@ConnectedSocket() socket: Socket, @MessageBody() entrada: unknown) {
    try {
      const datos = this.datos(socket, entrada);
      if (typeof datos.desafioId !== 'string' || typeof datos.paraPersonaId !== 'string' || typeof datos.emoji !== 'string') throw new BadRequestException('Completá destinatario, desafío y reacción');
      if (!socket.rooms.has(`desafio:${datos.desafioId}`)) throw new BadRequestException('Abrí el detalle y suscribite al desafío');
      return await this.realtime.alentar(datos.desafioId, { id: socket.data.personaId, nombre: socket.data.nombre }, datos.paraPersonaId, datos.emoji);
    } catch (e) {
      return this.error(e);
    }
  }
}
