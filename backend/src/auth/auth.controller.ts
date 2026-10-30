import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: { identificador: string; password: string }) {
    return this.auth.login(body.identificador, body.password);
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