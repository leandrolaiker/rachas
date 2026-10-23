import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CrearCheckinDto } from './dto/crear-checkin.dto';

@Controller('desafios/:desafioId/checkins')
export class CheckinsController {
  constructor(private servicio: CheckinsService) {}

  @Post()
  registrar(
    @Headers('x-usuario-id') usuarioId: string,
    @Param('desafioId') desafioId: string,
    @Body() datos: CrearCheckinDto,
  ) {
    return this.servicio.registrar(usuarioId, desafioId, datos);
  }

  @Get()
  listar(
    @Param('desafioId') desafioId: string,
    @Query('personaId') personaId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicio.listar(desafioId, personaId, page ? Number(page) : 1, limit ? Number(limit) : 50);
  }

  @Get('racha/:personaId')
  rachas(@Param('desafioId') desafioId: string, @Param('personaId') personaId: string) {
    return this.servicio.rachas(personaId, desafioId);
  }

  @Delete('ultimo')
  deshacer(@Headers('x-usuario-id') usuarioId: string, @Param('desafioId') desafioId: string) {
    return this.servicio.deshacer(usuarioId, desafioId);
  }
}
