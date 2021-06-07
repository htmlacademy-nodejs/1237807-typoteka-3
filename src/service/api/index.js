'use strict';

const categoriesRoute = require(`./categories`);
const articlesRoute = require(`./articles`);
const commentsRoute = require(`./comments`);
const searchRoute = require(`./search`);
const userRoute = require(`./user`);

module.exports = {
  categoriesRoute,
  articlesRoute,
  commentsRoute,
  searchRoute,
  userRoute
};
