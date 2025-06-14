import { Module } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturesEntity, ProductsEntity } from '@hellcat29a/shared-entities';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturesEntity, ProductsEntity])],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
