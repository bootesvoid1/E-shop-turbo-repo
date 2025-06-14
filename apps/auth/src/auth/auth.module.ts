import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@repo/shared-entities'; 
import { RabbitMQModule } from '@repo/shared-entities';
import { JwtConfigModule } from 'src/config/jwt/jwt.config.module';

@Module({
  imports: [
    JwtConfigModule,
    TypeOrmModule.forFeature([UsersEntity]), 
    RabbitMQModule
    
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}