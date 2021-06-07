'use strict';

const {Router} = require(`express`);
const categoryExists = require(`../middlewares/category-exists`);
const categoryUniqueName = require(`../middlewares/category-unique-name`);
const categoryHasArticles = require(`../middlewares/category-has-articles`);
const userAdmin = require(`../middlewares/user-admin`);
const schemaValidator = require(`../middlewares/schema-validator`);
const categorySchema = require(`../schemas/category`);
const {HttpCode} = require(`../../const/server.const`);

module.exports = (serviceLocator) => {
  const route = new Router();

  const app = serviceLocator.get(`app`);
  const service = serviceLocator.get(`categoryService`);
  const logger = serviceLocator.get(`logger`);

  const isCategoryExists = categoryExists(service, logger);
  const isCategoryNameUnique = categoryUniqueName(service, logger);
  const isCategoryHasArticles = categoryHasArticles(service, logger);
  const isCategoryValid = schemaValidator(categorySchema, logger);
  const isUserAdmin = userAdmin(logger);

  app.use(`/categories`, route);

  route.get(`/`, async (req, res) => {
    const {count = false} = req.query;
    let categories;

    categories = count ? await service.findAllWithCount() : await service.findAll();

    return res.status(HttpCode.OK).json(categories);
  });

  route.get(`/:id`, async (req, res) => {
    const {id} = req.params;

    const category = await service.findOne(id);

    return res.status(HttpCode.OK).json(category);
  });

  route.post(`/`, [isUserAdmin, isCategoryValid, isCategoryNameUnique], async (req, res) => {
    const category = await service.add(req.body);

    return res.status(HttpCode.CREATED).json(category);
  });

  route.put(`/:categoryId`, [isUserAdmin, isCategoryExists, isCategoryValid, isCategoryNameUnique], async (req, res) => {
    const {categoryId} = req.params;

    await service.update(categoryId, req.body);

    return res.status(HttpCode.OK).send(`Category was updated`);
  });

  route.delete(`/:categoryId`, [isUserAdmin, isCategoryExists, isCategoryHasArticles], async (req, res) => {
    const {categoryId} = req.params;

    await service.delete(categoryId);

    return res.status(HttpCode.OK).send(`Category was deleted`);
  });

  return route;
};
