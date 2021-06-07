'use strict';

const axios = require(`axios`);
const {API_PREFIX} = require(`../const/server.const`);

const TIMEOUT = 1000;
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = `http://localhost`;

const port = process.env.API_PORT || DEFAULT_PORT;
const host = process.env.HOST || DEFAULT_HOST;
const defaultURL = `${host}:${port}${API_PREFIX}/`;

class API {

  constructor(baseURL, timeout) {
    this._http = axios.create({
      baseURL,
      timeout
    });
  }

  getArticles({offset, limit, comments} = {}) {
    return this._load(`/articles`, {params: {offset, limit, comments}});
  }

  getPopularArticles({limit} = {}) {
    return this._load(`/articles/popular`, {params: {limit}});
  }

  getArticlesByCategory(id, {offset, limit} = {}) {
    return this._load(`/articles/category/${id}`, {params: {offset, limit}});
  }

  getArticle(id, {comments} = {}) {
    return this._load(`/articles/${id}`, {params: {comments}});
  }

  getCategories({count} = {}) {
    return this._load(`/categories`, {params: {count}});
  }

  getCategory(id) {
    return this._load(`/categories/${id}`);
  }

  getAllComments() {
    return this._load(`/allcomments`);
  }

  getLastComments({limit} = {}) {
    return this._load(`/lastcomments`, {params: {limit}});
  }

  search(query) {
    return this._load(`/search`, {params: {query}});
  }

  createArticle(data, isAdmin) {
    return this._load(`/articles`, {
      method: `POST`,
      params: {isAdmin},
      data
    });
  }

  updateArticle(id, data, isAdmin) {
    return this._load(`/articles/${id}`, {
      method: `PUT`,
      params: {isAdmin},
      data
    });
  }

  deleteArticle(id, isAdmin) {
    return this._load(`/articles/${id}`, {
      method: `DELETE`,
      params: {isAdmin},
    });
  }

  createComment(id, userId, data) {
    return this._load(`/articles/${id}/comments`, {
      method: `POST`,
      params: {userId},
      data
    });
  }

  deleteComment(id, commentId, isAdmin) {
    return this._load(`/articles/${id}/comments/${commentId}`, {
      method: `DELETE`,
      params: {isAdmin},
    });
  }

  createUser(data) {
    return this._load(`/user`, {
      method: `POST`,
      data
    });
  }

  createCategory(data, isAdmin) {
    return this._load(`/categories`, {
      method: `POST`,
      params: {isAdmin},
      data
    });
  }

  updateCategory(id, data, isAdmin) {
    return this._load(`/categories/${id}`, {
      method: `PUT`,
      params: {isAdmin},
      data
    });
  }

  deleteCategory(id, isAdmin) {
    return this._load(`/categories/${id}`, {
      method: `DELETE`,
      params: {isAdmin},
    });
  }

  loginUser(data) {
    return this._load(`/user/login`, {
      method: `POST`,
      data
    });
  }

  async _load(url, options) {
    const response = await this._http.request({url, ...options});
    return response.data;
  }
}

const defaultAPI = new API(defaultURL, TIMEOUT);

module.exports = {
  API,
  getAPI: () => defaultAPI
};
