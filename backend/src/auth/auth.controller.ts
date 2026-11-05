import { Body, Controller, Get, Post, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { identificador: string; password: string }) {
    // Social login (Google) aplica el AuthGuard. Este endpoint queda para compatibilidad.
    throw new UnauthorizedException('Solo login social ahora');
  }

  @Get('me')
  me(@Req() req: any) {
    return this.auth.me(req.token);
  }

  @Post('logout')
  logout(@Req() req: any) {
    return this.auth.logout(req.token);
  }
}