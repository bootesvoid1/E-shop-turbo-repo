// src/user/user.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserData, UserCredentials } from 'src/models/types';
import { UsersEntity } from '@repo/shared-entities';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

  async findOne(id: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.handleError(error);
    }
  }
  async checkCredentials(credentials: UserCredentials) {
    try {
      const { email, password } = credentials;
      if (!credentials?.email || !credentials?.password) {
        return { error: 'Email and password are required' };
      }

      const user = await this.userRepository.findOne({
        where: { email },

        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'role',
          'password',
          'isTwoFactorEnabled',
        ],
      });

      if (!user) {
        return { error: 'Invalid email or password' };
      }

      const isPasswordValid = await this.verifyPassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        return { error: 'Invalid email or password' };
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createUser(userData: CreateUserData) {
    try {
      const { email, password, ...restUserData } = userData;

      await this.checkEmailExists(email);

      const hashedPassword = await this.hashPassword(password);

      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        ...restUserData,
      } as UsersEntity);

      const savedUser = await this.userRepository.save(newUser);
      const { password: _, ...userWithoutPassword } = savedUser;

      return userWithoutPassword;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async checkEmailExists(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      this.logger.error(`Error hashing password: ${error.message}`);
      throw new InternalServerErrorException('Error processing password');
    }
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      this.logger.error(`Error verifying password: ${error.message}`);
      throw new InternalServerErrorException('Error verifying credentials');
    }
  }
  private handleError(error: any) {
    this.logger.error('User service error:', error);

    if (
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException ||
      error instanceof ConflictException
    ) {
      return { error: error.message };
    }

    return {
      error: 'An unexpected error occurred. Please try again.',
    };
  }
  async updateTwoFactorCode(userId: number, code: string, expiresAt: Date) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.twoFactorCode = code;
      user.twoFactorCodeExpiresAt = expiresAt;

      const updatedUser = await this.userRepository.save(user);
      const { password, ...rest } = updatedUser;
      return rest;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyTwoFactorCode(userId: number, code: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return { error: 'User not found' };
    }

    if (!user.twoFactorCode || !user.twoFactorCodeExpiresAt) {
      return { error: '2FA not initialized' };
    }

    const now = new Date();
    if (user.twoFactorCode !== code) {
      return { error: 'Invalid 2FA code' };
    }

    if (now > user.twoFactorCodeExpiresAt) {
      return { error: '2FA code expired' };
    }

    // Clear the 2FA fields
    user.twoFactorCode = '';
    user.twoFactorCodeExpiresAt = null;
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
