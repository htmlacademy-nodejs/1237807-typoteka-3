'use strict';

const {HttpCode} = require(`../../const/server.const`);
const {CategoryMessage} = require(`../../const/shemas.const`);

module.exports = (service, logger) => async (req, res, next) => {
  const {categoryId} = req.params;

  const categoriesWithArticles = await service.findAllWithArticles(categoryId);

  if (categoriesWithArticles.length !== 0) {
    res.status(HttpCode.BAD_REQUEST)
    .json({errorMessage: CategoryMessage.HAS_ARTICLES});
    return logger.error(`Category with articles can't be deleted`);
  }

  return next();
};
