'use strict';

const TOP_PER_PAGE = 4;

const ARTICLES_PER_PAGE = 8;

const PAGER_WIDTH = 2;

const WrapperType = {
  "/search": `wrapper-color`,
  "/categories": `wrapper wrapper--nobackground`,
  "/my": `wrapper wrapper--nobackground`,
  "/my/comments": `wrapper wrapper--nobackground`
};

module.exports = {ARTICLES_PER_PAGE, TOP_PER_PAGE, PAGER_WIDTH, WrapperType};
