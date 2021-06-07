'use strict';

const express = require(`express`);
const http = require(`http`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);
const initDB = require(`../lib/init-db`);
const articles = require(`./articles`);
const ArticleService = require(`../data-service/article`);
const CategoryService = require(`../data-service/category`);
const CommentService = require(`../data-service/comment`);
const serviceLocatorFactory = require(`../lib/service-locator`);
const SocketService = require(`../lib/socket-service`);
const {getLogger} = require(`../lib/test-logger`);
const {mockArticles, mockCategories, mockUsers, mockComments, mockPost} = require(`./articles.test-data`);
const {HttpCode} = require(`../../const/server.const`);
const {ArticleMessage} = require(`../../const/shemas.const`);

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, articles: mockArticles, users: mockUsers, comments: mockComments});
  const serviceLocator = serviceLocatorFactory();
  const app = express();
  const server = http.createServer(app);
  const logger = getLogger();
  app.use(express.json());

  serviceLocator.register(`app`, app);
  serviceLocator.register(`logger`, logger);
  serviceLocator.register(`socketService`, new SocketService(server));
  serviceLocator.register(`articleService`, new ArticleService(mockDB));
  serviceLocator.register(`categoryService`, new CategoryService(mockDB));
  serviceLocator.register(`commentService`, new CommentService(mockDB));
  serviceLocator.factory(`articles`, articles);
  serviceLocator.get(`articles`);

  return app;
};

describe(`API returns a list of all articles`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/articles`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 4 posts`, () => expect(response.body.length).toBe(4));
  test(`Second post's image equals "sea@1x.jpg"`, () => expect(response.body[1].image).toBe(`sea@1x.jpg`));
});

describe(`API returns a list of all articles in category`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/articles/category/10`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 2 posts`, () => expect(response.body.length).toBe(2));
  test(`First post's title equals "Лучшие рок-музыканты 20-века"`, () => expect(response.body[0].title).toBe(`Лучшие рок-музыканты 20-века`));
});

describe(`API returns a post with given id`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/articles/3`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Post's title is "Лучшие рок-музыканты 20-века"`, () => expect(response.body.title).toBe(`Лучшие рок-музыканты 20-века`));
});

describe(`API refuses to return non-existent post`, () => {

  test(`When trying to get non-existent post response code is 404`, async () => {
    const app = await createAPI();

    return request(app).get(`/articles/NOEXIST`)
    .expect(HttpCode.NOT_FOUND);
  });
});

describe(`API creates a post if data is valid`, () => {

  const newPost = JSON.parse(JSON.stringify(mockPost));

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).post(`/articles`).query({isAdmin: true}).send(newPost);
  });


  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Returns post with id equals 5`, () => expect(response.body.id).toEqual(5));

  test(`Articles count is changed`, () => request(app).get(`/articles`)
    .expect((res) => expect(res.body.length).toBe(5))
  );
});

describe(`API refuses to create a post`, () => {

  const newPost = JSON.parse(JSON.stringify(mockPost));

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`With any additional excess property response code is 400`, async () => {

    const badPost = {...newPost};
    badPost.excess = `excess value`;

    await request(app).post(`/articles`).query({isAdmin: true}).send(badPost)
      .expect(HttpCode.BAD_REQUEST);
  });

  describe(`Without required title property`, () => {
    const badPost = {...newPost};
    delete badPost.title;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.REQUIRED.TITLE));
  });

  describe(`Without required announce property`, () => {
    const badPost = {...newPost};
    delete badPost.announce;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.REQUIRED.ANNOUNCE));
  });

  describe(`Without required date property`, () => {
    const badPost = {...newPost};
    delete badPost.date;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.REQUIRED.DATE));
  });

  describe(`Without required categories property`, () => {
    const badPost = {...newPost};
    delete badPost.categories;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.REQUIRED.CATEGORIES));
  });

  describe(`With invalid date`, () => {
    const badPost = {...newPost};
    badPost.date = `07 Febraury 2009`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.VALID.DATE));
  });

  describe(`With invalid category id`, () => {
    const badPost = {...newPost};
    badPost.categories = [1, 2, 123];
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.VALID.CATEGORIES));
  });

  describe(`With categories not in array`, () => {
    const badPost = {...newPost};
    badPost.categories = `123`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.VALID.CATEGORIES));
  });

  describe(`With title length less than min value`, () => {
    const badPost = {...newPost};
    badPost.title = `Тест`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.MIN_TITLE_LENGTH));
  });

  describe(`With announce length less than min value`, () => {
    const badPost = {...newPost};
    badPost.announce = `Короткий анонс`;
    let response;

    beforeAll(async () => {
      response = await request(app).post(`/articles`).query({isAdmin: true}).send(badPost);
    });

    test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
    test(`Returns valid error message`, () => expect(response.text).toMatch(ArticleMessage.MIN_ANNOUNCE_LENGTH));
  });

  test(`When trying to create a post not by admin response code is 403`, () => {

    return request(app).post(`/articles`).send(newPost)
      .expect(HttpCode.FORBIDDEN);
  });
});

describe(`API changes existent post`, () => {

  const newPost = JSON.parse(JSON.stringify(mockPost));

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).put(`/articles/4`).query({isAdmin: true}).send(newPost);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns message of success updating`, () => expect(response.text).toBe(`Post was updated`));

  test(`Post is really changed`, () => request(app).get(`/articles/4`)
    .expect((res) => expect(res.body.title).toBe(`Хорошая валидная статья про котиков`))
  );
});

describe(`API refuses to change post`, () => {

  const newPost = JSON.parse(JSON.stringify(mockPost));

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`When trying to change non-existent post response code is 404`, () => {

    const validPost = {...newPost};

    return request(app).put(`/articles/NOEXIST`).query({isAdmin: true}).send(validPost)
      .expect(HttpCode.NOT_FOUND);
  });

  test(`When trying to change a post with invalid data response code is 400`, () => {

    const invalidPost = {...newPost};
    delete invalidPost.announce;

    return request(app).put(`/articles/4`).query({isAdmin: true}).send(invalidPost)
      .expect(HttpCode.BAD_REQUEST);
  });

  test(`When trying to change a post not by admin response code is 403`, () => {

    return request(app).put(`/articles/4`).send(newPost)
      .expect(HttpCode.FORBIDDEN);
  });
});

describe(`API correctly deletes a post`, () => {

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).delete(`/articles/3`).query({isAdmin: true});
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns message of success deleting`, () => expect(response.text).toBe(`Post was deleted`));

  test(`Articles count is 3 now`, () => request(app).get(`/articles`)
    .expect((res) => expect(res.body.length).toBe(3))
  );
});

describe(`API refuses to delete post`, () => {

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });


  test(`When trying to delete non-existent post response code is 404`, async () => {

    return request(app).delete(`/articles/NOEXIST`).query({isAdmin: true})
    .expect(HttpCode.NOT_FOUND);
  });

  test(`When trying to delete a post not by admin response code is 403`, () => {

    return request(app).delete(`/articles/4`).expect(HttpCode.FORBIDDEN);
  });
});
