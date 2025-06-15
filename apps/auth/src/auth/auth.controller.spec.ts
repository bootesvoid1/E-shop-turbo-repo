// auth.controller.spec.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/signin-user.dto';


describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/POST auth/login should return token and user', () => {
    const dto: SignInUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    jest.spyOn(authService, 'signIn').mockResolvedValue({
      access_token: 'mocked-jwt-token',
      user: { id: 1, email: 'test@example.com', isTwoFactorEnabled: false },
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(200)
      .expect({
        access_token: 'mocked-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
        },
      });
  });

  it('/POST auth/2fa should verify code and return token', () => {
    const twoFactorDto = { userId: '1', code: '123456' };
    jest.spyOn(authService, 'twoFactor').mockResolvedValue({
      access_token: 'mocked-jwt-token',
      user: { id: 1, email: 'test@example.com' },
    });

    return request(app.getHttpServer())
      .post('/auth/2fa')
      .send(twoFactorDto)
      .expect(200)
      .expect({
        access_token: 'mocked-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
        },
      });
  });

  it('/POST auth/create should create a user', () => {
    jest.spyOn(authService, 'create').mockResolvedValue({
      id: 1,
      email: 'new@example.com',
    } as any);

    return request(app.getHttpServer())
      .post('/auth/create')
      .send({
        email: 'new@example.com',
        password: 'password',
      })
      .expect(201)
      .expect({
        id: 1,
        email: 'new@example.com',
      });
  });
});