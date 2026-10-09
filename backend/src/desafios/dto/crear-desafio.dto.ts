import { IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator';

const fecha = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export class CrearDesafioDto {
  @IsString()
  @Length(3, 60)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  descripcion?: string;

  @IsIn(['SALUD', 'ESTUDIO', 'FINANZAS', 'BIENESTAR', 'OTRO'])
  categoria: string;

  @IsString()
  @Matches(fecha)
  inicio: string;

  @IsString()
  @Matches(fecha)
  fin: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(20)
  maxParticipantes?: number;
}
