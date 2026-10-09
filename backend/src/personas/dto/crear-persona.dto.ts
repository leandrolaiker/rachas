import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator';

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
  zonaHoraria?: string;
}
