// @ts-check

// import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
// import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  // let cookie;
  let testData;
  // let tuser;

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

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(200);
  });
  afterEach(async () => {
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
