import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from './rabbitmq.module';
import { CategoryModule } from './category/category.module';
import { FeaturesModule } from './features/features.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_HOST as string),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['node_modules/@hellcat29a/shared-entities/dist/**/*.js'],
      synchronize: true,
    }),
    RabbitMQModule,
    CategoryModule,
    FeaturesModule,
    ManufacturerModule,
    ReviewsModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
