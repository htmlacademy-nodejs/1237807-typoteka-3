'use strict';

const {Router} = require(`express`);
const userAlreadyExists = require(`../middlewares/user-already-exists`);
const schemaValidator = require(`../middlewares/schema-validator`);
const authenticate = require(`../middlewares/authenticate`);
const userSchema = require(`../schemas/user`);
const loginSchema = require(`../schemas/login`);
const {HttpCode} = require(`../../const/server.const`);

module.exports = (serviceLocator) => {
  const route = new Router();

  const app = serviceLocator.get(`app`);
  const service = serviceLocator.get(`userService`);
  const logger = serviceLocator.get(`logger`);

  const isUserAlreadyExists = userAlreadyExists(service, logger);
  const isUserValid = schemaValidator(userSchema, logger);
  const isLoginDataValid = schemaValidator(loginSchema, logger);
  const isLoginDataExists = authenticate(service, logger);

  app.use(`/user`, route);

  route.post(`/`, [isUserValid, isUserAlreadyExists], async (req, res) => {

    try {
      const user = await service.add(req.body);

      return res.status(HttpCode.CREATED).json(user);
    } catch (err) {
      logger.error(`Can't get user service.`);
      return res.status(HttpCode.BAD_REQUEST).json({errorMessages: [`Something wrong`]});
    }
  });

  route.post(`/login`, [isLoginDataValid, isLoginDataExists], (req, res) => {

    const {user} = res.locals;

    return res.status(HttpCode.OK).json(user);
  });

  return route;
};
