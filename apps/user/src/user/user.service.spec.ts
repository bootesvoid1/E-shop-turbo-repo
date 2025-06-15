// apps/user/src/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { UsersEntity } from '@repo/shared-entities';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<UsersEntity>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    isTwoFactorEnabled: false,
    twoFactorCode: null,
    twoFactorCodeExpiresAt: null,
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(() => mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<UsersEntity>>(getRepositoryToken(UsersEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkCredentials', () => {
    it('should return user without password if valid credentials', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.checkCredentials({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual(expect.objectNotHasProperty('password'));
    });

    it('should return error if user not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

      const result = await service.checkCredentials({
        email: 'wrong@example.com',
        password: 'wrongpass',
      });

      expect(result).toHaveProperty('error');
    });
  });

  describe('createUser', () => {
    it('should throw ConflictException if email exists', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUser);

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'save').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed');

      const result = await service.createUser({
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('updateTwoFactorCode', () => {
    it('should update 2FA fields', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repo, 'save').mockResolvedValue({
        ...mockUser,
        twoFactorCode: '123456',
        twoFactorCodeExpiresAt: new Date(Date.now() + 300000),
      });

      const updated = await service.updateTwoFactorCode(
        1,
        '123456',
        new Date(Date.now() + 300000),
      );

      expect(updated.twoFactorCode).toBe('123456');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.updateTwoFactorCode(999, '123', new Date())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyTwoFactorCode', () => {
    const now = new Date();

    it('should return user if code matches and not expired', async () => {
      const mockUserWith2FA = {
        ...mockUser,
        twoFactorCode: '123456',
        twoFactorCodeExpiresAt: new Date(now.getTime() + 60000),
      };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUserWith2FA);

      const result = await service.verifyTwoFactorCode(1, '123456');

      expect(result).not.toHaveProperty('error');
    });

    it('should return error if code does not match', async () => {
      const mockUserWith2FA = {
        ...mockUser,
        twoFactorCode: '123456',
        twoFactorCodeExpiresAt: new Date(now.getTime() + 60000),
      };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUserWith2FA);

      const result = await service.verifyTwoFactorCode(1, 'wrongcode');

      expect(result).toHaveProperty('error', 'Invalid 2FA code');
    });

    it('should return error if 2FA expired', async () => {
      const mockUserWithExpired2FA = {
        ...mockUser,
        twoFactorCode: '123456',
        twoFactorCodeExpiresAt: new Date(now.getTime() - 1000),
      };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockUserWithExpired2FA);

      const result = await service.verifyTwoFactorCode(1, '123456');

      expect(result).toHaveProperty('error', '2FA code expired');
    });
  });
});