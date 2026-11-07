import { Global, Module } from '@nestjs/common';
import { PersonasModule } from '../personas/personas.module';
import { TokenService } from './token.service';
import { PersonaAuthService } from './persona-auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [PersonasModule],
  controllers: [AuthController],
  providers: [TokenService, PersonaAuthService],
  exports: [TokenService, PersonaAuthService],
})
export class AuthModule {}