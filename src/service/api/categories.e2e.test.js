'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);
const initDB = require(`../lib/init-db`);
const categories = require(`./categories`);
const DataService = require(`../data-service/category`);
const serviceLocatorFactory = require(`../lib/service-locator`);
const {getLogger} = require(`../lib/test-logger`);
const {mockArticles, mockCategories, mockUsers, mockComments, mockCategory} = require(`./categories.test-data`);
const {HttpCode} = require(`../../const/server.const`);
const {CategoryMessage} = require(`../../const/shemas.const`);

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {articles: mockArticles, categories: mockCategories, users: mockUsers, comments: mockComments});
  const serviceLocator = serviceLocatorFactory();
  const app = express();
  const logger = getLogger();
  app.use(express.json());

  serviceLocator.register(`app`, app);
  serviceLocator.register(`logger`, logger);
  serviceLocator.register(`categoryService`, new DataService(mockDB));
  serviceLocator.factory(`categories`, categories);
  serviceLocator.get(`categories`);

  return app;
};

describe(`API returns category list`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 8 categories`, () => expect(response.body.length).toBe(8));

  test(`Category names are "Кино", "Железо", "Разное", "Без рамки", "IT", "Программирование", "Путешествия", "Категория без статей"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Кино`, `Железо`, `Разное`, `Без рамки`, `IT`, `Программирование`, `Путешествия`, `Категория без статей`])
      )
  );
});

describe(`API returns a category with given id`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/categories/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Category name is "Кино"`, () => expect(response.body.name).toBe(`Кино`));
});

describe(`API creates a category if data is valid`, () => {

  const newCategory = JSON.parse(JSON.stringify(mockCategory));

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).post(`/categories`).query({isAdmin: true}).send(newCategory);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Returns category with id equals 9`, () => expect(response.body.id).toEqual(9));

  test(`Categories count is changed`, () => request(app).get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(9))
  );
});

describe(`API refuses to create a category`, () => {

  const newCategory = JSON.parse(JSON.stringify(mockCategory));

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`With any additional excess property response code is 400`, async () => {

    const badCategory = {...newCategory};
    badCategory.excess = `excess value`;

    await request(app).post(`/categories`).query({isAdmin: true}).send(badCategory)
      .expect(HttpCode.BAD_REQUEST);
  });

  describe(`Without required name property`, () => {
    const badCategory = {...newCategory};
    delete badCategory.name;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/categories`).query({isAdmin: true}).send(badCategory);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(CategoryMessage.REQUIRED));
  });


  describe(`With name length less than min value`, () => {
    const badCategory = {...newCategory};
    badCategory.name = `Тест`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/categories`).query({isAdmin: true}).send(badCategory);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(CategoryMessage.MIN_TEXT_LENGTH));
  });

  describe(`With name length more than max value`, () => {
    const badCategory = {...newCategory};
    badCategory.name = `Тест Тест Тест Тест Тест Тест Тест`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/categories`).query({isAdmin: true}).send(badCategory);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(CategoryMessage.MAX_TEXT_LENGTH));
  });

  describe(`When trying to create a category with name which already exists`, () => {
    const badCategory = {...newCategory};
    badCategory.name = `Железо`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/categories`).query({isAdmin: true}).send(badCategory);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(CategoryMessage.NAME_ALREADY_EXISTS));
  });

  test(`When trying to create a category not by admin response code is 403`, () => {

    return request(app).post(`/categories`).send(newCategory)
      .expect(HttpCode.FORBIDDEN);
  });
});

describe(`API changes existent category`, () => {

  const newCategory = JSON.parse(JSON.stringify(mockCategory));

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).put(`/categories/1`).query({isAdmin: true}).send(newCategory);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns message of success updating`, () => expect(response.text).toBe(`Category was updated`));

  test(`Category is really changed`, () => request(app).get(`/categories/1`)
    .expect((res) => expect(res.body.name).toBe(`Новая категория`))
  );
});

describe(`API refuses to change category`, () => {

  const newCategory = JSON.parse(JSON.stringify(mockCategory));

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`When trying to change non-existent category response code is 404`, () => {

    return request(app).put(`/categories/NOEXIST`).query({isAdmin: true}).send(newCategory)
      .expect(HttpCode.NOT_FOUND);
  });

  test(`When trying to change a category with invalid data response code is 400`, () => {

    const invalidCategory = {...newCategory};
    delete invalidCategory.name;

    return request(app).put(`/categories/1`).query({isAdmin: true}).send(invalidCategory)
      .expect(HttpCode.BAD_REQUEST);
  });

  describe(`When trying to change a category with name which already exists`, () => {

    const badCategory = {...newCategory};
    badCategory.name = `Программирование`;
    let response;

    beforeAll(async () => {
      response = await request(app).put(`/categories/1`).query({isAdmin: true}).send(badCategory);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(CategoryMessage.NAME_ALREADY_EXISTS));
  });

  test(`When trying to change a category not by admin response code is 403`, () => {

    return request(app).put(`/categories/1`).send(newCategory)
      .expect(HttpCode.FORBIDDEN);
  });
});

describe(`API correctly deletes a category`, () => {

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).delete(`/categories/8`).query({isAdmin: true});
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns message of success deleting`, () => expect(response.text).toBe(`Category was deleted`));

  test(`Categories count is 7 now`, () => request(app).get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(7))
  );
});

describe(`API refuses to delete category`, () => {

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  describe(`When trying to delete a category with articles`, () => {

    let response;

    beforeAll(async () => {
      response = await request(app).delete(`/categories/3`).query({isAdmin: true});
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(CategoryMessage.HAS_ARTICLES));
  });

  test(`When trying to delete non-existent category response code is 404`, async () => {

    return request(app).delete(`/categories/NOEXIST`).query({isAdmin: true})
    .expect(HttpCode.NOT_FOUND);
  });

  test(`When trying to delete a category not by admin response code is 403`, () => {

    return request(app).delete(`/categories/3`).expect(HttpCode.FORBIDDEN);
  });
});
