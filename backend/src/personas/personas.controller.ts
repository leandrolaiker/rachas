import { Body, Controller, ForbiddenException, Get, Param, Patch, Post } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';
import { Public, UsuarioId } from '../auth/auth.guard';

@Controller('personas')
export class PersonasController {
  constructor(private servicio: PersonasService) {}

  @Public()
  @Post()
  crear(@Body() datos: CrearPersonaDto) {
    return this.servicio.crear(datos);
  }

  @Public()
  @Get()
  listar() {
    return this.servicio.listar();
  }

  @Public()
  @Get(':id')
  una(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarPersonaDto, @UsuarioId() usuarioId: string) {
    if (usuarioId !== id) throw new ForbiddenException('No autorizado');
    return this.servicio.actualizar(id, datos);
  }
}
