'use strict';

const {Router} = require(`express`);
const apiFactory = require(`../api`);
const {upload} = require(`../middlewares/multer`);
const privateRoute = require(`../middlewares/private-route`);
const loggedRoute = require(`../middlewares/logged-route`);
const {getPagerRange} = require(`../../utils`);
const {ARTICLES_PER_PAGE, PAGER_WIDTH} = require(`../../const/view.const`);

const articlesRouter = new Router();
const api = apiFactory.getAPI();

articlesRouter.get(`/category/:id`, async (req, res, next) => {
  const {id} = req.params;
  let {page = 1} = req.query;
  page = +page;
  const limit = ARTICLES_PER_PAGE;
  const offset = (page - 1) * ARTICLES_PER_PAGE;

  try {
    const [{count, articles}, currentCategory, categories] = await Promise.all([
      api.getArticlesByCategory(id, {limit, offset}),
      api.getCategory(id),
      api.getCategories({count: true})
    ]);

    const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);
    const range = getPagerRange(page, totalPages, PAGER_WIDTH);
    const withPagination = totalPages > 1;

    res.render(`articles/articles-by-category`, {currentCategory, count, articles, categories, page, totalPages, range, withPagination});
  } catch (err) {

    next(err);
  }

});

articlesRouter.get(`/add`, privateRoute, async (req, res, next) => {

  const {article = null, errorMessages = null} = req.session;

  try {
    const categories = await api.getCategories();
    req.session.article = null;
    req.session.errorMessages = null;
    res.render(`articles/new-post`, {categories, article, errorMessages});
  } catch (err) {
    next(err);
  }
});

articlesRouter.post(`/add`, [privateRoute, upload.single(`upload`)], async (req, res) => {

  const {body, file} = req;

  const articleData = {
    title: body.title,
    date: body.date,
    announce: body.announcement,
    fullText: body[`full-text`],
    categories: typeof body.category === `string` ? [body.category] : body.category || [],
    image: file ? file.filename : body.photo || ``
  };

  try {
    await api.createArticle(articleData, req.session.isAdmin);
    return res.redirect(`/my`);
  } catch (error) {
    req.session.article = articleData;
    req.session.errorMessages = error.response.data.errorMessages;

    return res.redirect(`/articles/add`);
  }
});

articlesRouter.get(`/edit/:id`, privateRoute, async (req, res, next) => {
  const {id} = req.params;
  const {newData = null, errorMessages = null} = req.session;

  try {
    const categories = await api.getCategories();
    let article;

    article = newData ? {...newData, id} : await api.getArticle(id);

    if (!newData) {
      const articleCategories = article.categories.reduce((acc, item) => ([
        item.id.toString(),
        ...acc
      ]), []);
      article = {...article, categories: articleCategories};
    }

    req.session.newData = null;
    req.session.errorMessages = null;
    res.render(`articles/new-post`, {article, categories, errorMessages});
  } catch (err) {
    next(err);
  }
});

articlesRouter.post(`/edit/:id`, [privateRoute, upload.single(`upload`)], async (req, res) => {
  const {id} = req.params;
  const {body, file} = req;

  const newData = {
    title: body.title,
    date: body.date,
    announce: body.announcement,
    fullText: body[`full-text`],
    categories: typeof body.category === `string` ? [body.category] : body.category || [],
    image: file ? file.filename : body.photo || ``
  };

  try {
    await api.updateArticle(id, newData, req.session.isAdmin);
    return res.redirect(`/my`);
  } catch (error) {
    req.session.newData = newData;
    req.session.errorMessages = error.response.data.errorMessages;

    return res.redirect(`/articles/edit/${id}`);
  }
});

articlesRouter.get(`/delete/:id`, privateRoute, async (req, res, next) => {

  const {id} = req.params;

  try {
    await api.deleteArticle(id, req.session.isAdmin);
    res.redirect(`back`);
  } catch (err) {
    next(err);
  }
});

articlesRouter.get(`/:id`, async (req, res, next) => {
  const {id} = req.params;
  const {errorMessages = null} = req.session;
  const {referer} = req.headers;

  try {
    const [article, allCategories] = await Promise.all([
      api.getArticle(id, {comments: true}),
      api.getCategories({count: true})
    ]);

    const categories = allCategories.filter((category) => {
      return article.categories.some((item) => item.id === category.id);
    });

    const back = referer;

    req.session.errorMessages = null;
    res.render(`articles/post`, {article, categories, errorMessages, back});
  } catch (err) {
    next(err);
  }
});

articlesRouter.post(`/:id`, [loggedRoute, upload.single(`upload`)], async (req, res) => {

  const {id} = req.params;
  const userId = req.session.loggedUser.id;
  const {body} = req;

  const commentData = {
    text: body.message
  };

  try {
    await api.createComment(id, userId, commentData);
    return res.redirect(`back`);
  } catch (error) {
    req.session.errorMessages = error.response.data.errorMessages;
    return res.redirect(`back`);
  }
});

articlesRouter.get(`/:id/comments/:commentId`, privateRoute, async (req, res, next) => {

  const {id, commentId} = req.params;

  try {
    await api.deleteComment(id, commentId, req.session.isAdmin);
    res.redirect(`back`);
  } catch (err) {
    next(err);
  }
});

module.exports = articlesRouter;
