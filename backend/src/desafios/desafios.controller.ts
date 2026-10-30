import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { CrearDesafioDto } from './dto/crear-desafio.dto';
import { ActualizarDesafioDto } from './dto/actualizar-desafio.dto';

@Controller('desafios')
export class DesafiosController {
  constructor(private servicio: DesafiosService) {}

  @Post()
  crear(@Req() req: any, @Body() datos: CrearDesafioDto) {
    return this.servicio.crear(req.usuarioId, datos);
  }

  @Get()
  listar(
    @Query('estado') estado?: string,
    @Query('categoria') categoria?: string,
    @Query('personaId') personaId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicio.listar({ estado, categoria, personaId, page: page ? Number(page) : 1, limit: limit ? Number(limit) : 20 });
  }

  @Get('resumen/:personaId')
  resumen(@Param('personaId') personaId: string) {
    return this.servicio.resumenPersona(personaId);
  }

  @Get('persona/:personaId')
  dePersona(@Param('personaId') personaId: string) {
    return this.servicio.desafiosDePersona(personaId);
  }

  @Get(':id/ranking')
  ranking(@Param('id') id: string) {
    return this.servicio.ranking(id);
  }

  @Get(':id/ganador')
  ganador(@Param('id') id: string) {
    return this.servicio.ganador(id);
  }

  @Get(':id')
  uno(@Param('id') id: string) {
    return this.servicio.uno(id);
  }

  @Patch(':id')
  actualizar(@Req() req: any, @Param('id') id: string, @Body() datos: ActualizarDesafioDto) {
    return this.servicio.actualizar(req.usuarioId, id, datos);
  }

  @Post(':id/cancelar')
  cancelar(@Req() req: any, @Param('id') id: string) {
    return this.servicio.cancelar(req.usuarioId, id);
  }

  @Post('unirse')
  unirse(@Req() req: any, @Body('codigo') codigo: string) {
    return this.servicio.unirse(req.usuarioId, codigo);
  }

  @Delete(':id/participacion')
  abandonar(@Req() req: any, @Param('id') id: string) {
    return this.servicio.abandonar(req.usuarioId, id);
  }

  @Get(':id/participantes')
  participantes(@Param('id') id: string) {
    return this.servicio.participantes(id);
  }
}
