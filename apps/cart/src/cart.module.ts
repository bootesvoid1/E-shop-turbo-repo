import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '@bootesvoid1/shared-entities';
import { RabbitMQModule } from '@bootesvoid1/shared-entities';

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