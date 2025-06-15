// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@repo/shared-entities/';
import { SignInUserDto } from './dto/signin-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, it } from 'node:test';

describe('AuthService', () => {
  let service: AuthService;
  let clientProxy: ClientProxy;
  let jwtService: JwtService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'USER_SERVICE',
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(() => 'mocked-jwt-token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            send2FACode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    clientProxy = module.get<ClientProxy>('USER_SERVICE');
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const dto: SignInUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should return a token and user if 2FA is not enabled', async () => {
      jest.spyOn(clientProxy, 'send').mockImplementation(() =>
        of({ id: 1, email: 'test@example.com', isTwoFactorEnabled: false }),
      );

      const result = await service.signIn(dto);
      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          isTwoFactorEnabled: false,
        },
      });
    });

    it('should return requires2FA flag if 2FA is enabled', async () => {
      jest.spyOn(clientProxy, 'send').mockImplementation(() =>
        of({ id: 1, email: 'test@example.com', isTwoFactorEnabled: true }),
      );
      jest.spyOn(mailService, 'send2FACode').mockImplementation(() => Promise.resolve());

      const result = await service.signIn(dto);
      expect(result).toEqual({
        requires2FA: true,
        userId: 1,
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      jest.spyOn(clientProxy, 'send').mockImplementation(() =>
        of({ error: 'Invalid credentials' })
      );

      await expect(service.signIn(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle timeout error', async () => {
      jest.spyOn(clientProxy, 'send').mockImplementation(() =>
        throwError(() => new Error('Timeout'))
      );

      await expect(service.signIn(dto)).rejects.toThrow('Authentication failed. Please try again later.');
    });
  });

  describe('twoFactor', () => {
    const twoFactorDto = { userId: '1', code: '123456' };

    it('should return a token after successful 2FA verification', async () => {
      jest.spyOn(clientProxy, 'send').mockImplementation(() =>
        of({ id: 1, email: 'test@example.com' })
      );

      const result = await service.twoFactor(twoFactorDto);
      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
        },
      });
    });

    it('should throw UnauthorizedException if 2FA fails', async () => {
      jest.spyOn(clientProxy, 'send').mockImplementation(() =>
        of({ error: 'Invalid 2FA code' })
      );

      await expect(service.twoFactor(twoFactorDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});