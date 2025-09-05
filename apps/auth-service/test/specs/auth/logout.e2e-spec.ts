import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ROUTER_END_TO_END_TESTER } from '../router';
import { createServer } from '../../utils/create-server';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UserRepository } from '../../../src/modules/store/repositories/user.repository';
import { faker } from '@faker-js/faker';
import { SexEnum } from '../../../src/modules/store/enums/sex.enum';

describe('AuthController logout (e2e)', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createServer();

    authService = app.get(AuthService);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createAccount(username: string, password: string) {
    const hashedPassword = await authService.hashPassword(password);
    const name = faker.person.fullName();
    const sex = SexEnum.MALE;
    const code = faker.string.alphanumeric(20);
    const address = faker.location.streetAddress();

    await userRepository.createInitAccount(
      username,
      hashedPassword,
      name,
      sex,
      code,
      address,
    );
  }

  async function createLoginSession(username: string, password: string) {
    await createAccount(username, password);

    const result = await request(app.getHttpServer())
      .post(ROUTER_END_TO_END_TESTER.Auth.login)
      .set('x-device-id', '1')
      .send({
        username,
        password,
      });

    return {
      accessToken: result.body.data.accessToken,
      refreshToken: result.body.data.refreshToken,
    };
  }

  describe('Validation', () => {
    it('Should return 401 when request is not header', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.logout)
        .send();

      expect(result.status).toEqual(401);

      return;
    });
    it('Should return 401 when request is false header', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.logout)
        .set('Authorization', faker.string.uuid())
        .send({
          username: undefined,
          password: undefined,
        });

      expect(result.status).toEqual(401);

      return;
    });
    it('Should return 401 when request is header empty', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.logout)
        .set('Authorization', '')
        .send();

      expect(result.status).toEqual(401);

      return;
    });
  });

  describe('Business', () => {
    it('Should return 201 when logout ok', async () => {
      const username = faker.string.alphanumeric(10);
      const password = faker.string.alphanumeric(10);

      const token = await createLoginSession(username, password);
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.logout)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send();

      expect(result.status).toEqual(201);

      return;
    });

    it('Should return 401 when not send access token', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.logout)
        .send();

      expect(result.status).toEqual(401);

      return;
    });

    it('Should return 401 when send invalid token', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.logout)
        .set('Authorization', `Bearer ${faker.string.ulid()}`)
        .send();

      expect(result.status).toEqual(401);

      return;
    });
  });
});
