import { IsOptional, IsString, Length } from 'class-validator';

export class ActualizarPersonaDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nombre?: string;

  @IsOptional()
  @IsString()
  zonaHoraria?: string;
}
