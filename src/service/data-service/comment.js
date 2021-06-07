'use strict';

const Aliase = require(`../models/aliase`);

class CommentService {

  constructor(sequelize) {
    this._Comment = sequelize.models.Comment;
  }

  async findAll() {
    const comments = await this._Comment.findAll({
      include: [Aliase.USERS, Aliase.ARTICLES],
      order: [[`createdAt`, `DESC`]]
    });

    return comments.map((comment) => comment.get());
  }

  async findAllByArticle(articleId) {
    return this._Comment.findAll({
      where: {articleId},
      raw: true
    });
  }

  async findLast(limit) {
    const comments = await this._Comment.findAll({
      limit,
      include: [Aliase.USERS],
      order: [[`createdAt`, `DESC`]]
    });

    return comments.map((comment) => comment.get());
  }

  async create(articleId, userId, comment) {
    const newComment = await this._Comment.create({
      articleId,
      userId,
      ...comment
    });
    return newComment.get();
  }

  async delete(id) {
    const deletedRows = await this._Comment.destroy({
      where: {id}
    });
    return !!deletedRows;
  }

  async deleteAllByArticle(articleId) {
    const deletedRows = await this._Comment.destroy({
      where: {articleId}
    });
    return !!deletedRows;
  }
}

module.exports = CommentService;
