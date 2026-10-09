import { IsDateString, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearCheckinDto {
  @IsOptional()
  @IsDateString()
  dia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  nota?: string;

  @IsOptional()
  @IsNumber()
  valor?: number;
}
