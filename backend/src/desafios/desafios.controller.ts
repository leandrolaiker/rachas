import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { CrearDesafioDto } from './dto/crear-desafio.dto';
import { ActualizarDesafioDto } from './dto/actualizar-desafio.dto';

@Controller('desafios')
export class DesafiosController {
  constructor(private servicio: DesafiosService) {}

  @Post()
  crear(@Headers('x-usuario-id') usuarioId: string, @Body() datos: CrearDesafioDto) {
    return this.servicio.crear(usuarioId, datos);
  }

  @Get()
  listar(@Query('estado') estado?: string, @Query('categoria') categoria?: string, @Query('personaId') personaId?: string) {
    return this.servicio.listar({ estado, categoria, personaId });
  }

  @Get('persona/:personaId')
  dePersona(@Param('personaId') personaId: string) {
    return this.servicio.desafiosDePersona(personaId);
  }

  @Get(':id')
  uno(@Param('id') id: string) {
    return this.servicio.uno(id);
  }

  @Patch(':id')
  actualizar(@Headers('x-usuario-id') usuarioId: string, @Param('id') id: string, @Body() datos: ActualizarDesafioDto) {
    return this.servicio.actualizar(usuarioId, id, datos);
  }

  @Post(':id/cancelar')
  cancelar(@Headers('x-usuario-id') usuarioId: string, @Param('id') id: string) {
    return this.servicio.cancelar(usuarioId, id);
  }

  @Post('unirse')
  unirse(@Headers('x-usuario-id') usuarioId: string, @Body('codigo') codigo: string) {
    return this.servicio.unirse(usuarioId, codigo);
  }

  @Delete(':id/participacion')
  abandonar(@Headers('x-usuario-id') usuarioId: string, @Param('id') id: string) {
    return this.servicio.abandonar(usuarioId, id);
  }

  @Get(':id/participantes')
  participantes(@Param('id') id: string) {
    return this.servicio.participantes(id);
  }
}
