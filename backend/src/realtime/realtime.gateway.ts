import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Persona } from '../personas/persona.schema';
import { Participacion } from '../participaciones/participacion.schema';
import { RealtimeService } from './realtime.service';

const ALIENTO_EMOJIS = ['👏', '🔥', '💪', '⭐', '🎉'];

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly ultimoAliento = new Map<string, number>();
  private readonly personasPorSocket = new Map<string, string>();
  private readonly aliasPorSocket = new Map<string, string>();

  constructor(
    @InjectModel(Persona.name) private personas: Model<Persona>,
    @InjectModel(Participacion.name) private partes: Model<Participacion>,
    private realtime: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.setServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth && (client.handshake.auth as any).token) ||
        (client.handshake.headers.authorization as string)?.replace(/^Bearer\s+/i, '') ||
        (client.handshake.headers['x-auth-token'] as string);
      if (!token) throw new Error('sin token');
      const persona = await this.personas.findOne({ authToken: token }).exec();
      if (!persona) throw new Error('token invalido');
      this.personasPorSocket.set(client.id, persona._id.toString());
      this.aliasPorSocket.set(client.id, persona.alias);
      this.logger.log(`ws conectado ${persona.alias}`);
    } catch (e) {
      this.logger.warn(`ws rechazado: ${(e as Error).message}`);
      client.emit('error', { message: 'No autorizado' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.personasPorSocket.delete(client.id);
    this.aliasPorSocket.delete(client.id);
  }

  private async resolverPersona(client: Socket): Promise<string | undefined> {
    let personaId = this.personasPorSocket.get(client.id);
    if (personaId) return personaId;
    const token =
      (client.handshake.auth && (client.handshake.auth as any).token) ||
      (client.handshake.headers.authorization as string)?.replace(/^Bearer\\s+/i, '') ||
      (client.handshake.headers['x-auth-token'] as string);
    if (!token) return undefined;
    const persona = await this.personas.findOne({ authToken: token }).exec();
    if (!persona) return undefined;
    this.personasPorSocket.set(client.id, persona._id.toString());
    this.aliasPorSocket.set(client.id, persona.alias);
    return persona._id.toString();
  }

  @SubscribeMessage('unirse_desafio')
  async handleJoin(client: Socket, payload: { desafioId: string }) {
    const personaId = await this.resolverPersona(client);
    const desafioId = payload?.desafioId;
    this.logger.log(`join client=${client.id} persona=${personaId} desafio=${desafioId}`);
    if (!personaId || !desafioId || !Types.ObjectId.isValid(desafioId)) {
      throw new WsException('Datos invalidos');
    }
    const parte = await this.partes.findOne({ desafioId: new Types.ObjectId(desafioId), personaId: new Types.ObjectId(personaId), activa: true }).exec();
    if (!parte) throw new WsException('No participas en este desafio');
    await client.join(`desafio:${desafioId}`);
    client.emit('suscripto', { desafioId });
    return { ok: true };
  }

  @SubscribeMessage('salir_desafio')
  async handleLeave(client: Socket, payload: { desafioId: string }) {
    const desafioId = payload?.desafioId;
    if (desafioId) await client.leave(`desafio:${desafioId}`);
    return { ok: true };
  }

  @SubscribeMessage('aliento')
  async handleAliento(client: Socket, payload: { desafioId: string; paraPersonaId: string; emoji: string }) {
    const dePersonaId = await this.resolverPersona(client);
    const alias = this.aliasPorSocket.get(client.id);
    const { desafioId, paraPersonaId, emoji } = payload || ({} as any);
    if (!dePersonaId || !desafioId || !paraPersonaId) throw new WsException('Datos invalidos');
    if (!Types.ObjectId.isValid(desafioId) || !Types.ObjectId.isValid(paraPersonaId)) throw new WsException('Datos invalidos');
    if (!ALIENTO_EMOJIS.includes(emoji)) throw new WsException('Emoji no permitido');
    if (dePersonaId === paraPersonaId) throw new WsException('No podes alentarte a vos mismo');
    const [origen, destino] = await Promise.all([
      this.partes.findOne({ desafioId: new Types.ObjectId(desafioId), personaId: new Types.ObjectId(dePersonaId), activa: true }).exec(),
      this.partes.findOne({ desafioId: new Types.ObjectId(desafioId), personaId: new Types.ObjectId(paraPersonaId), activa: true }).exec(),
    ]);
    if (!origen || !destino) throw new WsException('Ambos deben participar del desafio');
    const clave = `${dePersonaId}:${desafioId}`;
    const ahora = Date.now();
    const ultimo = this.ultimoAliento.get(clave) || 0;
    if (ahora - ultimo < 10000) throw new WsException('Espera 10 segundos entre alientos');
    this.ultimoAliento.set(clave, ahora);
    this.server.to(`desafio:${desafioId}`).emit('aliento', {
      desafioId,
      dePersonaId,
      deAlias: alias,
      paraPersonaId,
      emoji,
    });
    return { ok: true };
  }
}