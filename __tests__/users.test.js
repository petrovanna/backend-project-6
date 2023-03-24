// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    // TODO: пока один раз перед тестами
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
  });

  beforeEach(async () => {
  });

  it('test registration', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);

    const responseAuthIn = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(responseAuthIn.statusCode).toBe(200);

    const [sessionCookie] = responseAuthIn.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };

    const responseAuthOut = await app.inject({
      method: 'DELETE',
      url: '/users/:id',
      cookies: cookie,
    });

    expect(responseAuthOut.statusCode).toBe(302);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('update', async () => { // new
    const response = await app.inject({
      method: 'PATCH',
      url: '/users/:id',
      name: 'updateUser',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
  });

  it('edit', async () => { // new
    const response = await app.inject({
      method: 'GET',
      url: '/users/:id/edit',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('delete', async () => { // new
    const response = await app.inject({
      method: 'DELETE',
      url: '/users/:id',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
