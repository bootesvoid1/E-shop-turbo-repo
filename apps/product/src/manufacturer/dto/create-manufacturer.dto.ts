import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateManufacturerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  details: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  products: number[];
}
