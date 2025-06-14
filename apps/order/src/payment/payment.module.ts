import { Module } from '@nestjs/common';
import { AppController } from './payment.controller';
import { AppService } from './payment.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
