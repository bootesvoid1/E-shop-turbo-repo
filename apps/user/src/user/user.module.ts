import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@repo/shared-entities';
import { SERVICE_NAMES } from '@repo/shared-entities';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    RabbitMQModule.register([
      { name: SERVICE_NAMES.USER, queue: 'user_queue'}
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}