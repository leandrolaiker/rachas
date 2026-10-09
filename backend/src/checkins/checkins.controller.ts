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
  listar(@Param('desafioId') desafioId: string, @Query('personaId') personaId: string) {
    return this.servicio.listar(desafioId, personaId);
  }

  @Delete('ultimo')
  deshacer(@Headers('x-usuario-id') usuarioId: string, @Param('desafioId') desafioId: string) {
    return this.servicio.deshacer(usuarioId, desafioId);
  }
}
