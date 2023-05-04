// @ts-check

import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  let testData;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });
  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    testData = getTestData();
  });

  it('test registration', async () => {
    const responseAuthIn = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: testData.statuses.existing,
      },
    });

    expect(responseAuthIn.statusCode).toBe(200);

    const [sessionCookie] = responseAuthIn.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };

    const responseAuthOut = await app.inject({
      method: 'DELETE',
      url: '/statuses/1',
      cookies: cookie,
    });

    expect(responseAuthOut.statusCode).toBe(302);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(302);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
    });

    expect(response.statusCode).toBe(302);
  });

  it('create', async () => {
    const params = testData.statuses.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
    const status = await models.taskStatus.query().findOne({ name: params.name });
    expect(status).toMatchObject(params);
  });

  it('update', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/statuses/1',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
  });

  it('edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses/2/edit',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
  });

  it('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/statuses/2',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
  });

  afterEach(async () => {
    await knex('task_statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
