'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);
const initDB = require(`../lib/init-db`);
const search = require(`./search`);
const DataService = require(`../data-service/search`);
const serviceLocatorFactory = require(`../lib/service-locator`);
const {getLogger} = require(`../lib/test-logger`);
const {mockArticles, mockCategories, mockUsers, mockComments} = require(`./search.test-data`);
const {HttpCode} = require(`../../const/server.const`);

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
const serviceLocator = serviceLocatorFactory();
const app = express();
const logger = getLogger();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, articles: mockArticles, users: mockUsers, comments: mockComments});
  serviceLocator.register(`app`, app);
  serviceLocator.register(`logger`, logger);
  serviceLocator.register(`searchService`, new DataService(mockDB));
  serviceLocator.factory(`search`, search);
  serviceLocator.get(`search`);
});

describe(`API returns post based on search query`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app).get(`/search`)
      .query({
        query: `Борьба с прокрастинацией`
      });
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`1 post found`, () => expect(response.body.length).toBe(1));
  test(`Post has correct image`, () => expect(response.body[0].image).toBe(`skyscraper@1x.jpg`));

});

test(`API returns empty array if nothing is found`, async () => {
  const res = await request(app).get(`/search`)
     .query({
       query: `Котики`
     });

  expect(res.body.length).toBe(0);
});

test(`API returns 400 when query string is absent`,
    () => request(app)
      .get(`/search`)
      .expect(HttpCode.BAD_REQUEST)
);
