import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';

@Controller('personas')
export class PersonasController {
  constructor(private servicio: PersonasService) {}

  @Post()
  crear(@Body() datos: CrearPersonaDto) {
    return this.servicio.crear(datos);
  }

  @Get()
  listar() {
    return this.servicio.listar();
  }

  @Get(':id')
  una(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarPersonaDto) {
    return this.servicio.actualizar(id, datos);
  }
}
