import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@repo/shared-entities';
import { SERVICE_NAMES } from '@repo/shared-entities';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {UsersEntity} from '@repo/shared-entities';
import {DatabaseModule} from '@repo/shared-entities';
import { DataSource } from 'typeorm';
import { UsersEntityRepository } from './repository/user.repository';
@Module({
  imports: [  
    DatabaseModule,
    TypeOrmModule.forFeature([UsersEntity]),
    RabbitMQModule.register([
      { name: SERVICE_NAMES.USER, queue: 'user_queue'}
    ]),
  ],
  controllers: [UserController],
  providers: [UserService,
    {
      provide: UsersEntityRepository,
      useFactory: (dataSource: DataSource) => new UsersEntityRepository(dataSource),
      inject: [DataSource],
    },
  ],
  
})
export class UserModule {}