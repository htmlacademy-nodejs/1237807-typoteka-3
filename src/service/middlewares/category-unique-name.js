'use strict';

const {HttpCode} = require(`../../const/server.const`);
const {CategoryMessage} = require(`../../const/shemas.const`);

module.exports = (service, logger) => async (req, res, next) => {

  const {name} = req.body;

  const categories = await service.findAll();
  const isCategoryNameExist = categories.some((item) => item.name === name);

  if (isCategoryNameExist) {
    res.status(HttpCode.BAD_REQUEST)
    .json({errorMessages: [CategoryMessage.NAME_ALREADY_EXISTS]});
    return logger.error(`Category with this name already exists`);
  }

  return next();
};
