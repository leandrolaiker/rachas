import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonasModule } from './personas/personas.module';
import { DesafiosModule } from './desafios/desafios.module';
import { ParticipacionesModule } from './participaciones/participaciones.module';
import { CheckinsModule } from './checkins/checkins.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { SeedService } from './seed/seed.service';
import { Persona, PersonaSchema } from './personas/persona.schema';
import { Desafio, DesafioSchema } from './desafios/desafio.schema';
import { Participacion, ParticipacionSchema } from './participaciones/participacion.schema';
import { Checkin, CheckinSchema } from './checkins/checkin.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/rachas',
        retryAttempts: 2,
        retryDelay: 2000,
      }),
    }),
    MongooseModule.forFeature([
      { name: Persona.name, schema: PersonaSchema },
      { name: Desafio.name, schema: DesafioSchema },
      { name: Participacion.name, schema: ParticipacionSchema },
      { name: Checkin.name, schema: CheckinSchema },
    ]),
    PersonasModule,
    DesafiosModule,
    ParticipacionesModule,
    CheckinsModule,
    AuthModule,
  ],
  providers: [SeedService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}

