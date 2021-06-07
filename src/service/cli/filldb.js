'use strict';

const fs = require(`fs`).promises;
const sequelize = require(`../lib/sequelize`);
const initDatabase = require(`../lib/init-db`);
const {getLogger} = require(`../lib/logger`);
const {getRandomInt, shuffleArray} = require(`../../utils`);
const {ExitCode} = require(`../../const/server.const`);

const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_IMAGES_PATH = `./data/images.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;
const FILE_NAMES_PATH = `./data/names.txt`;
const FILE_SURNAMES_PATH = `./data/surnames.txt`;
const FILE_EMAILS_PATH = `./data/emails.txt`;

const logger = getLogger({});

const MONTH_PERIOD = 3;
const USERS_COUNT = 5;
const DEFAULT_PASSWORD = `$2b$10$Wg4P.Qy.zhnYdUPKGfni8uPMdj08DcjQWwrbkg6bOWT.u2cYiXlAC`;

const ArticleRestrict = {
  MIN: 3,
  MAX: 1000,
};

const AnnounceRestrict = {
  MIN: 1,
  MAX: 2,
};

const FullTextRestrict = {
  MIN: 1,
  MAX: 5,
};

const CategoriesRestrict = {
  MIN: 1,
  MAX: 3,
};

const CommentsRestrict = {
  MIN: 1,
  MAX: 4,
};

const CommentLengthRestrict = {
  MIN: 1,
  MAX: 3,
};

const AvatarRestrict = {
  MIN: 1,
  MAX: 5,
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`);
  } catch (err) {
    logger.error(`Error when reading file: ${err.message}`);
    return [];
  }
};

const getAvatarName = (number) => `avatar-${number}.png`;

const generateDate = () => {
  const earliestDate = new Date();
  earliestDate.setMonth(earliestDate.getMonth() - MONTH_PERIOD);
  const minTimestamp = earliestDate - new Date(0);
  const maxTimestamp = new Date() - new Date(0);
  const randomTimestamp = getRandomInt(minTimestamp, maxTimestamp);
  const createdDate = new Date(randomTimestamp);
  return createdDate;
};

const generateUsers = (count, names, surnames, emails) => (
  Array(count).fill({}).map((_, index) => ({
    firstname: names[getRandomInt(0, names.length - 1)],
    lastname: surnames[getRandomInt(0, surnames.length - 1)],
    email: emails[index],
    password: DEFAULT_PASSWORD,
    avatar: getAvatarName(getRandomInt(AvatarRestrict.MIN, AvatarRestrict.MAX)),
    admin: index === 0
  }))
);

const generateArticleComments = (count, comments, article, usersCount) => (
  Array(count).fill({}).map(() => ({
    text: shuffleArray(comments)
      .slice(0, getRandomInt(CommentLengthRestrict.MIN, CommentLengthRestrict.MAX))
      .join(` `),
    articleId: article,
    userId: getRandomInt(1, usersCount)
  }))
);

const generateArticles = (count, titles, sentences, images, categories) => (
  Array(count).fill({}).map(() => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    date: generateDate(),
    announce: shuffleArray(sentences).slice(0, getRandomInt(AnnounceRestrict.MIN, AnnounceRestrict.MAX)).join(` `),
    fullText: shuffleArray(sentences).slice(0, getRandomInt(FullTextRestrict.MIN, FullTextRestrict.MAX)).join(` `),
    image: images[getRandomInt(0, images.length - 1)],
    categories: shuffleArray(categories).slice(0, getRandomInt(CategoriesRestrict.MIN, CategoriesRestrict.MAX)),
  }))
);

const generateComments = (comments, count, usersCount) => {

  return Array(count).fill().reduce((allComments, _, index) => {

    return allComments.concat(
        generateArticleComments(getRandomInt(CommentsRestrict.MIN, CommentsRestrict.MAX), comments, index + 1, usersCount)
    );
  }, []);
};

module.exports = {
  name: `--filldb`,

  async run(args) {

    try {
      logger.info(`Trying to connect to database...`);
      await sequelize.authenticate();
    } catch (err) {
      logger.error(`An error occured: ${err.message}`);
      process.exit(ExitCode.error);
    }
    logger.info(`Connection to database established`);

    const titles = await readContent(FILE_TITLES_PATH);
    const sentences = await readContent(FILE_SENTENCES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);
    const images = await readContent(FILE_IMAGES_PATH);
    const commentsSentences = await readContent(FILE_COMMENTS_PATH);
    const names = await readContent(FILE_NAMES_PATH);
    const surnames = await readContent(FILE_SURNAMES_PATH);
    const emails = await readContent(FILE_EMAILS_PATH);

    const [count] = args;
    const countNumber = Number.parseInt(count, 10) || ArticleRestrict.MIN;

    if (countNumber > ArticleRestrict.MAX) {
      logger.error(`Не больше 1000 публикаций`);
      process.exit(ExitCode.success);
    }

    const countArticle = countNumber > ArticleRestrict.MIN ? countNumber : ArticleRestrict.MIN;

    const users = generateUsers(USERS_COUNT, names, surnames, emails);
    const articles = generateArticles(countArticle, titles, sentences, images, categories);
    const comments = generateComments(commentsSentences, countArticle, USERS_COUNT);


    return initDatabase(sequelize, {articles, categories, users, comments});
  }
};
