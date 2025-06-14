import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoriesEntity,
  FeaturesEntity,
  ManufacturersEntity,
  ProductsEntity,
  SizesVariants,
  UsersEntity,
} from '@hellcat29a/shared-entities';
import { SizeVariantController } from './_sizeVariant/sizeVariant.controller';
import { SizeVariantService } from './_sizeVariant/sizeVariant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductsEntity,
      CategoriesEntity,
      ManufacturersEntity,
      FeaturesEntity,
      UsersEntity,
      SizesVariants,
    ]),
  ],
  controllers: [ProductController, SizeVariantController],
  providers: [ProductService, SizeVariantService],
})
export class ProductModule {}
