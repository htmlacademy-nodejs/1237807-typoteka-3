'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../const`);
const articleExists = require(`../middlewares/article-exists`);
const schemaValidator = require(`../middlewares/schema-validator`);
const commentSchema = require(`../schemas/comment`);

module.exports = (serviceLocator) => {
  const route = new Router({mergeParams: true});

  const app = serviceLocator.get(`app`);
  const articleService = serviceLocator.get(`articleService`);
  const commentService = serviceLocator.get(`commentService`);
  const logger = serviceLocator.get(`logger`);

  const isPostExists = articleExists(articleService, logger);
  const isCommentValid = schemaValidator(commentSchema, logger);

  app.use(`/`, route);

  route.get(`/allcomments`, async (req, res) => {

    const comments = await commentService.findAll();

    return res.status(HttpCode.OK).json(comments);
  });

  route.get(`/lastcomments`, async (req, res) => {
    const {limit} = req.query;

    const comments = await commentService.findLast(limit);

    return res.status(HttpCode.OK).json(comments);
  });

  route.get(`/articles/:articleId/comments`, isPostExists, async (req, res) => {
    const {post} = res.locals;

    const comments = await commentService.findAllByArticle(post.id);

    return res.status(HttpCode.OK).json(comments);
  });

  route.delete(`/articles/:articleId/comments/:commentId`, isPostExists, async (req, res) => {
    const {commentId} = req.params;

    const deleted = await commentService.delete(commentId);

    if (!deleted) {
      res.status(HttpCode.NOT_FOUND).send(`Comment with ${commentId} not found`);
      return logger.error(`Comment not found: ${commentId}`);
    }

    return res.status(HttpCode.OK).send(`Comment was deleted`);
  });

  route.post(`/articles/:articleId/comments`, [isPostExists, isCommentValid], async (req, res) => {
    const {post} = res.locals;
    const {userId} = req.query;

    const comment = await commentService.create(post.id, userId, req.body);

    return res.status(HttpCode.CREATED).json(comment);
  });

  return route;
};
