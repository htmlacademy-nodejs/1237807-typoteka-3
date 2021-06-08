"use strict";

const defineModels = require(`../lib/define-models`);

module.exports = async (sequelize, {articles, categories, users, comments}) => {
  const {Category, Article, User, Comment} = defineModels(sequelize);
  await sequelize.sync({force: true});

  const categoryModels = await Category.bulkCreate(
      categories.map((item) => ({name: item}))
  );

  const categoryIdByName = categoryModels.reduce((acc, item) => ({
    [item.name]: item.id,
    ...acc
  }), {});

  await User.bulkCreate(users);

  const articlePromises = articles.map(async (article) => {
    const articleModel = await Article.create(article);
    await articleModel.addCategories(
        article.categories.map((category) => categoryIdByName[category])
    );
  });
  await Promise.all(articlePromises);

  await Comment.bulkCreate(comments);
};
