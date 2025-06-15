import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
// apps/user/src/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

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
      imports: [UserModule],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserByEmail', () => {
    it('should return user if credentials are valid', async () => {
      jest.spyOn(service, 'checkCredentials').mockResolvedValue(mockUser);

      const result = await controller.getUserByEmail({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual(mockUser);
    });

    it('should return error on invalid credentials', async () => {
      jest.spyOn(service, 'checkCredentials').mockResolvedValue({ error: 'Invalid' });

      const result = await controller.getUserByEmail({
        email: 'wrong@example.com',
        password: 'wrongpass',
      });

      expect(result).toHaveProperty('error');
    });
  });

  describe('create', () => {
    it('should call userService.createUser', async () => {
      jest.spyOn(service, 'createUser').mockResolvedValue(mockUser);

      const result = await controller.create({
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result).toEqual(mockUser);
    });

    it('should return error if user already exists', async () => {
      jest.spyOn(service, 'createUser').mockRejectedValue(new ConflictException('Already exists'));

      const result = await controller.create({
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result).toHaveProperty('error');
    });
  });

  describe('verify2FA', () => {
    it('should return user after successful 2FA', async () => {
      jest.spyOn(service, 'verifyTwoFactorCode').mockResolvedValue(mockUser);

      const result = await controller.verify2FA({ userId: 1, code: '123456' });

      expect(result).toEqual(mockUser);
    });

    it('should return error if 2FA fails', async () => {
      jest.spyOn(service, 'verifyTwoFactorCode').mockResolvedValue({ error: 'Invalid code' });

      const result = await controller.verify2FA({ userId: 1, code: 'wrong' });

      expect(result).toHaveProperty('error');
    });
  });
});