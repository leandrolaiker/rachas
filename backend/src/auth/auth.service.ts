import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PersonasService } from '../personas/personas.service';

export class LoginDto {
  identificador: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private personas: PersonasService) {}

  async login(identificador: string, password: string) {
    const personaDoc = await this.personas.buscarPorAliasOEmail(identificador);
    if (!personaDoc) throw new UnauthorizedException('Credenciales invalidas');
    const ok = await this.personas.verificarPassword(personaDoc.id, password);
    if (!ok) throw new UnauthorizedException('Credenciales invalidas');
    const token = await this.personas.iniciarSesion(personaDoc.id);
    const persona = await this.personas.buscarPorId(personaDoc.id);
    return { token, persona };
  }

  async me(token: string) {
    const persona = await this.personas.buscarPorToken(token);
    if (!persona) throw new UnauthorizedException('Token invalido');
    return persona;
  }

  async logout(token: string) {
    return this.personas.cerrarSesion(token);
  }
}