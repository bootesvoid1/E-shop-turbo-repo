import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtPayload, UserPayload } from 'src/models/types';
import { MailService } from '@repo/shared-entities';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signIn(signInUserDto: SignInUserDto): Promise<any> {
    try {
      this.logger.debug(`Attempting sign in for user: ${signInUserDto.email}`);

      const user = await this.getUserFromMicroservice(
        'user_queue',
        signInUserDto,
      );
      console.log(user);

      if (user.error) {
        throw new UnauthorizedException(user.error);
      }
      console.log(user);
      if (user.isTwoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.updateUser2FA(user.id, code, expiresAt);
        await this.mailService.send2FACode(user, code);

        return { requires2FA: true, userId: user.id, email: user.email };
      }

      const access_token = await this.generateToken(user);

      return { access_token, user };
    } catch (error) {
      this.handleError(error);
    }
  }

  async twoFactor(twoFactorDto: { userId: string; code: string }) {
    const { userId, code } = twoFactorDto;

    const user = await firstValueFrom(
      this.userClient.send(
        { cmd: 'verify_2fa' },
        { userId: Number(userId), code },
      ),
    );

    console.log(user);
    if (!user || user.error) {
      throw new UnauthorizedException(user?.error || '2FA verification failed');
    }

    const access_token = await this.generateToken(user);

    return { access_token, user };
  }

  async create(userData: SignInUserDto): Promise<UserPayload> {
    try {
      this.logger.debug(`Creating new user: ${userData.email}`);

      const user = await this.getUserFromMicroservice(
        'create_user_queue',
        userData,
      );

      if (user && user?.error) {
        throw new Error('Failed to create user');
      }

      return user as UserPayload;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async getUserFromMicroservice(
    cmd: string,
    data: SignInUserDto,
  ): Promise<any | null> {
    return firstValueFrom(
      this.userClient.send<any, SignInUserDto>({ cmd }, data),
      {
        defaultValue: null,
      },
    );
  }

  private async generateToken(user: UserPayload): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  private handleError(error: any): never {
    this.logger.error('Auth service error:', error);

    if (error instanceof TimeoutError) {
      throw new Error('Service timeout. Please try again later.');
    }

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    throw new Error('Authentication failed. Please try again.');
  }
  private async updateUser2FA(userId: number, code: string, expiresAt: Date) {
    return firstValueFrom(
      this.userClient.send({ cmd: 'update_2fa' }, { userId, code, expiresAt }),
    );
  }
}
