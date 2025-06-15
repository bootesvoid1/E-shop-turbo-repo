import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '@repo/shared-entities';
import { RabbitMQModule } from '@repo/shared-entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity]),
    RabbitMQModule.register([
      { name: 'USER_SERVICE', queue: 'user_queue' },
      { name: 'PRODUCT_SERVICE', queue: 'product_queue'},
        ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}