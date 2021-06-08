"use strict";

const {CategoryModel, CommentModel, ArticleModel, ArticleCategoryModel, UserModel} = require(`../models`);

const define = (sequelize) => {
  const Category = CategoryModel.define(sequelize);
  const Comment = CommentModel.define(sequelize);
  const Article = ArticleModel.define(sequelize);
  const ArticleCategory = ArticleCategoryModel.define(sequelize);
  const User = UserModel.define(sequelize);

  [CategoryModel, CommentModel, ArticleModel, UserModel].forEach(
      (model) => model.defineRelations({Comment, Category, Article, ArticleCategory, User})
  );

  return {Category, Comment, Article, ArticleCategory, User};
};

module.exports = define;
