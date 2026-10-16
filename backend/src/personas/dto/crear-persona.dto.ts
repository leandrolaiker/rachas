import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CrearPersonaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  nombre: string;

  @IsString()
  @Length(3, 20)
  @Matches(/^[A-Za-z0-9_]+$/)
  alias: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]+\/[A-Za-z_+-]+(\/[A-Za-z_+-]+)*$/, { message: 'zonaHoraria debe ser un nombre IANA valido' })
  zonaHoraria?: string;
}
