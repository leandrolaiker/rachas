import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class ActualizarPersonaDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]+\/[A-Za-z_+-]+(\/[A-Za-z_+-]+)*$/, { message: 'zonaHoraria debe ser un nombre IANA valido' })
  zonaHoraria?: string;
}
