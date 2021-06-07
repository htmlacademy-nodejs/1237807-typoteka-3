'use strict';

const {HttpCode} = require(`../../const/server.const`);

module.exports = (service, logger) => async (req, res, next) => {
  const {articleId} = req.params;
  const {comments = false} = req.query;

  const post = await service.findOne(articleId, comments);

  if (!post) {
    res.status(HttpCode.NOT_FOUND).send(`Post with ${articleId} not found`);
    return logger.error(`Post not found: ${articleId}`);
  }

  res.locals.post = post;
  return next();
};
