'use strict';

const {HttpCode} = require(`../../const/server.const`);

module.exports = (service, logger) => async (req, res, next) => {
  const {categoryId} = req.params;

  const category = await service.findOne(categoryId);

  if (!category) {
    res.status(HttpCode.NOT_FOUND).send(`Category with ${categoryId} not found`);
    return logger.error(`Category not found: ${categoryId}`);
  }

  return next();
};
