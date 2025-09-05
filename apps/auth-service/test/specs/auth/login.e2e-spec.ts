import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ROUTER_END_TO_END_TESTER } from '../router';
import { createServer } from '../../utils/create-server';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { faker } from '@faker-js/faker';
import { UserRepository } from '../../../src/modules/store/repositories/user.repository';
import { SexEnum } from '../../../src/modules/store/enums/sex.enum';

describe('AuthController login (e2e)', () => {
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

  describe('Validation', () => {
    it('Should return 400 when request is null', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.login)
        .set('x-device-id', '1')
        .send({
          username: null,
          password: null,
        });

      expect(result.status).toEqual(400);
      expect(result.body).toMatchObject({
        message: [
          'username should not be empty',
          'username must be a string',
          'password should not be empty',
          'password must be a string',
        ],
        error: 'Bad Request',
        statusCode: 400,
      });

      return;
    });
    it('Should return 400 when request is undefined', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.login)
        .set('x-device-id', '1')
        .send({
          username: undefined,
          password: undefined,
        });

      expect(result.status).toEqual(400);
      expect(result.body).toMatchObject({
        statusCode: 400,
        message: [
          'username should not be empty',
          'username must be a string',
          'password should not be empty',
          'password must be a string',
        ],
        error: 'Bad Request',
      });

      return;
    });
    it('Should return 400 when request is empty', async () => {
      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.login)
        .set('x-device-id', '1')
        .send({
          username: '',
          password: '',
        });

      expect(result.status).toEqual(400);
      expect(result.body).toMatchObject({
        statusCode: 400,
        message: [
          'username should not be empty',
          'password should not be empty',
        ],
        error: 'Bad Request',
      });

      return;
    });
  });

  describe('Business', () => {
    it('Should return 201 when login ok', async () => {
      const username = faker.phone.number({ style: 'international' });
      const password = faker.string.uuid();

      await createAccount(username, password);

      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.login)
        .set('x-device-id', '1')
        .send({
          username,
          password,
        });

      expect(result.status).toEqual(201);
      expect(typeof result.body.data.accessToken).toEqual('string');
      expect(typeof result.body.data.refreshToken).toEqual('string');

      return;
    });
    it('Should return 400 when wrong password', async () => {
      const username = faker.phone.number({ style: 'international' });
      const password = faker.string.uuid();
      const newPassword = faker.string.uuid();

      await createAccount(username, password);

      const result = await request(app.getHttpServer())
        .post(ROUTER_END_TO_END_TESTER.Auth.login)
        .set('x-device-id', '1')
        .send({
          username,
          password: newPassword,
        });

      expect(result.status).toEqual(401);
      expect(result.body).toMatchObject({
        statusCode: 401,
        message: 'Wrong username or password',
      });

      return;
    });
  });
});
