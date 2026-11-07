import {
  ForbiddenException,
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import type { Types } from 'mongoose';
import type { Persona } from '../personas/persona.schema';
import { TokenService } from './token.service';
import { PersonaAuthService } from './persona-auth.service';

export interface PeticionAutenticada extends Request {
  persona: Persona & { _id: Types.ObjectId };
}

export const Public = () => SetMetadata('isPublic', true);

export const UsuarioId = createParamDecorator(
  (_: unknown, contexto: ExecutionContext): string => {
    return String(contexto.switchToHttp().getRequest<PeticionAutenticada>().persona._id);
  },
);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly personas: PersonaAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    if (contexto.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (isPublic) return true;

    const request = contexto.switchToHttp().getRequest<PeticionAutenticada>();
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '')?.[1] ?? '';

    request.persona = await this.personas.resolver(await this.tokens.verificar(token), token) as unknown as Persona & { _id: Types.ObjectId };

    if (!request.persona.alias && !/^\/me(?:\/alias)?\/?$/.test(request.path)) {
      throw new ForbiddenException('Elegí un alias para completar tu perfil');
    }

    return true;
  }
}