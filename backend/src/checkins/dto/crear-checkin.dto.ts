import { IsDateString, IsNumber, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CrearCheckinDto {
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, { message: 'dia debe ser una fecha valida' })
  dia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  nota?: string;

  @IsOptional()
  @IsNumber()
  valor?: number;
}
