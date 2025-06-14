import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsEnum(['active', 'inactive', 'archived'])
  status: 'active' | 'inactive' | 'archived';

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  category_id: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  features: number[];

  @IsOptional()
  @IsNumber()
  manufacturer: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsOptional()
  sizes: number[];
}
