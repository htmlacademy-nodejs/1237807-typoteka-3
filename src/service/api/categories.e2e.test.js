'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);
const initDB = require(`../lib/init-db`);
const categories = require(`./categories`);
const DataService = require(`../data-service/category`);
const serviceLocatorFactory = require(`../lib/service-locator`);
const {mockArticles, mockCategories, mockUsers, mockComments} = require(`./categories.test-data`);
const {HttpCode} = require(`../../const`);

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
const serviceLocator = serviceLocatorFactory();
const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {articles: mockArticles, categories: mockCategories, users: mockUsers, comments: mockComments});
  serviceLocator.register(`app`, app);
  serviceLocator.register(`categoryService`, new DataService(mockDB));
  serviceLocator.factory(`categories`, categories);
  serviceLocator.get(`categories`);
});

describe(`API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app).get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 7 categories`, () => expect(response.body.length).toBe(7));

  test(`Category names are "Кино", "Железо", "Разное", "Без рамки", "IT", "Программирование", "Путешествия"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Кино`, `Железо`, `Разное`, `Без рамки`, `IT`, `Программирование`, `Путешествия`])
      )
  );
});
