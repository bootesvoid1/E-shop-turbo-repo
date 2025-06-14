import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from./order.servicevice';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
