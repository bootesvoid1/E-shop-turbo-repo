import { Module } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerController } from './manufacturer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ManufacturersEntity,
  ProductsEntity,
} from '@hellcat29a/shared-entities';

@Module({
  imports: [TypeOrmModule.forFeature([ManufacturersEntity, ProductsEntity])],
  controllers: [ManufacturerController],
  providers: [ManufacturerService],
})
export class ManufacturerModule {}
