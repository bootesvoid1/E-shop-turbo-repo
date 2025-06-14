import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  products: number[];
}
