'use strict';

const {Router} = require(`express`);
const categories = require(`../api/categories`);
const articles = require(`../api/articles`);
const comments = require(`../api/comments`);
const search = require(`../api/search`);
const getMockData = require(`../lib/get-mock-data`);
const serviceLocatorFactory = require(`../lib/service-locator`);

const {CategoryService, ArticleService, CommentService, SearchService} = require(`../data-service`);

module.exports = async (logger) => {
  const app = new Router();
  const serviceLocator = serviceLocatorFactory();

  const mockData = await getMockData();

  serviceLocator.register(`app`, app);
  serviceLocator.register(`logger`, logger);
  serviceLocator.register(`categoryService`, new CategoryService(mockData));
  serviceLocator.register(`articleService`, new ArticleService(mockData));
  serviceLocator.register(`commentService`, new CommentService());
  serviceLocator.register(`searchService`, new SearchService(mockData));

  serviceLocator.factory(`categories`, categories);
  serviceLocator.factory(`articles`, articles);
  serviceLocator.factory(`comments`, comments);
  serviceLocator.factory(`search`, search);

  serviceLocator.get(`categories`);
  serviceLocator.get(`articles`);
  serviceLocator.get(`comments`);
  serviceLocator.get(`search`);

  return app;
};
