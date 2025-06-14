import { Controller, Get } from '@nestjs/common';
import { OrderService } from./order.servicevice';

@Controller()
export class AppController {
  constructor(private readonly OrderService: OrderService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
