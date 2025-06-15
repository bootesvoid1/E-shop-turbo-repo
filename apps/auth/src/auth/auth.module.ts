import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, MailModule, SERVICE_NAMES, UsersEntity } from '@repo/shared-entities'; 
import { RabbitMQModule } from '@repo/shared-entities';
import { JwtConfigModule } from 'src/config/jwt/jwt.config.module';
import { UsersEntityRepository } from './repository/user.repository';
import { DataSource } from 'typeorm';


@Module({
  imports: [
    DatabaseModule,
    JwtConfigModule,
    MailModule,
    TypeOrmModule.forFeature([UsersEntity]), 
    RabbitMQModule.register([
      { name: SERVICE_NAMES.AUTH, queue: 'auth_queue'},
      { name: SERVICE_NAMES.USER, queue: 'user_queue'}

    ])],
  controllers: [AuthController],
  providers: [AuthService, {
    provide: UsersEntityRepository,
    useFactory: (dataSource: DataSource) => new UsersEntityRepository(dataSource),
    inject: [DataSource],
  },],
})
export class AuthModule {}