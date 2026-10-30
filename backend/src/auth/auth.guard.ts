import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PersonasService } from '../personas/personas.service';

export const Public = () => SetMetadata('isPublic', true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private personas: PersonasService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const header = req.headers['authorization'] || req.headers['x-auth-token'];
    const token = typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7).trim()
      : (typeof header === 'string' ? header.trim() : '');
    if (!token) throw new UnauthorizedException('Token requerido');

    const persona = await this.personas.buscarPorToken(token);
    if (!persona) throw new UnauthorizedException('Token invalido');

    req.token = token;
    req.usuarioId = persona.id;
    req.persona = persona;
    return true;
  }
}