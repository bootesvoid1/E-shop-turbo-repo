import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'user_queue' })
  async getUserByEmail(
    @Payload() credentials: { email: string; password: string },
  ) {
    try {
      const user = await this.userService.checkCredentials(credentials);
      return user;
    } catch (error) {
      return { error: error.message };
    }
  }
  @MessagePattern({ cmd: 'create_user_queue' })
  async create(userData) {
    const user = await this.userService.createUser(userData);
    return user;
  }

  @MessagePattern({ cmd: 'update_2fa' })
  update2FA(
    @Payload() data: { userId: number; code: string; expiresAt: string },
  ) {
    const { userId, code, expiresAt } = data;
    return this.userService.updateTwoFactorCode(
      userId,
      code,
      new Date(expiresAt),
    );
  }

  @MessagePattern({ cmd: 'verify_2fa' })
  verify2FA(@Payload() data: { userId: number; code: string }) {
    return this.userService.verifyTwoFactorCode(data.userId, data.code);
  }
}
