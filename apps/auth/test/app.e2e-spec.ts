// apps/auth/src/test/auth.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import * as request from 'supertest';



describe('AuthController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST auth/login', () => {
    it('should return 401 if email or password is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 200 and token if login is successful', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });
  });

  describe('/POST auth/2fa', () => {
    it('should validate 2FA code and return token', async () => {
      return request(app.getHttpServer())
        .post('/auth/2fa')
        .send({ userId: '1', code: '123456' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('should return 401 if 2FA code is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/2fa')
        .send({ userId: '1', code: 'wrongcode' })
        .expect(401);
    });
  });

  describe('/POST auth/create', () => {
    it('should create a new user and return user object', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password',
      };

      return request(app.getHttpServer())
        .post('/auth/create')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(newUser.email);
        });
    });

    it('should return error if user already exists', async () => {
      const existingUser = {
        email: 'test@example.com',
        password: 'password',
      };

      return request(app.getHttpServer())
        .post('/auth/create')
        .send(existingUser)
        .expect(500); // depends on how you handle errors
    });
  });
});