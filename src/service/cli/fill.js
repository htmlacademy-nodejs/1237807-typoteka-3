'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {getRandomInt, shuffleArray} = require(`../../utils`);
const {ExitCode} = require(`../../const/server.const`);

const FILE_NAME = `fill-db.sql`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_IMAGES_PATH = `./data/images.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const ArticleRestrict = {
  MIN: 3,
  MAX: 1000,
};

const AnnounceRestrict = {
  MIN: 1,
  MAX: 3,
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
  MIN: 2,
  MAX: 4,
};

const CommentLengthRestrict = {
  MIN: 1,
  MAX: 3,
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.trim().split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const generateComments = (count, articleId, userCount, comments) => (
  Array(count).fill({}).map(() => ({
    userId: getRandomInt(1, userCount),
    articleId,
    text: shuffleArray(comments)
      .slice(0, getRandomInt(CommentLengthRestrict.MIN, CommentLengthRestrict.MAX))
      .join(` `),
  }))
);

const generateCategories = (count, categoryCount) => {

  const categories = new Set(Array(count).fill().map(() => {
    return getRandomInt(1, categoryCount);
  }));

  return [...categories];
};

const generateArticles = (count, titles, categoryCount, userCount, sentences, images, comments) => (
  Array(count).fill({}).map((_, index) => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    announce: shuffleArray(sentences).slice(0, getRandomInt(AnnounceRestrict.MIN, AnnounceRestrict.MAX)).join(` `),
    fullText: shuffleArray(sentences).slice(0, getRandomInt(FullTextRestrict.MIN, FullTextRestrict.MAX)).join(` `),
    image: images[getRandomInt(0, images.length - 1)],
    category: generateCategories(getRandomInt(CategoriesRestrict.MIN, CategoriesRestrict.MAX), categoryCount),
    comments: generateComments(getRandomInt(CommentsRestrict.MIN, CommentsRestrict.MAX), index + 1, userCount, comments),
    userId: getRandomInt(1, userCount)
  }))
);

module.exports = {
  name: `--fill`,

  async run(args) {
    const titles = await readContent(FILE_TITLES_PATH);
    const sentences = await readContent(FILE_SENTENCES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);
    const images = await readContent(FILE_IMAGES_PATH);
    const commentSentences = await readContent(FILE_COMMENTS_PATH);

    const users = [
      {
        email: `ivanov@example.com`,
        passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
        firstName: `Иван`,
        lastName: `Иванов`,
        avatar: `avatar1.jpg`
      },
      {
        email: `petrov@example.com`,
        passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
        firstName: `Пётр`,
        lastName: `Петров`,
        avatar: `avatar2.jpg`
      }
    ];

    const [count] = args;
    const countNumber = Number.parseInt(count, 10) || ArticleRestrict.MIN;

    if (countNumber > ArticleRestrict.MAX) {
      console.error(chalk.red(`Не больше 1000 публикаций`));
      process.exit(ExitCode.success);
    }

    const countArticle = countNumber > ArticleRestrict.MIN ? countNumber : ArticleRestrict.MIN;

    const articles = generateArticles(countArticle, titles, categories.length, users.length, sentences, images, commentSentences);
    const comments = articles.flatMap((article) => article.comments);

    const articleCategories = articles.flatMap((article, index) => {
      return article.category.map((category) => ({articleId: index + 1, categoryId: category}));
    });

    const userValues = users.map(({email, passwordHash, firstName, lastName, avatar}) =>
      `('${email}', '${passwordHash}', '${firstName}', '${lastName}', '${avatar}')`
    ).join(`,\n`);

    const categoryValues = categories.map((name) => `('${name}')`).join(`,\n`);

    const articleValues = articles.map(({title, announce, fullText, image, userId}) =>
      `('${title}', '${announce}', '${fullText}', '${image}', ${userId})`
    ).join(`,\n`);

    const articleCategoryValues = articleCategories.map(({articleId, categoryId}) =>
      `(${articleId}, ${categoryId})`
    ).join(`,\n`);

    const commentValues = comments.map(({text, userId, articleId}) =>
      `('${text}', ${userId}, ${articleId})`
    ).join(`,\n`);

    const content = `
INSERT INTO users(email, password_hash, first_name, last_name, avatar) VALUES
${userValues};
INSERT INTO categories(name) VALUES
${categoryValues};
ALTER TABLE articles DISABLE TRIGGER ALL;
INSERT INTO articles(title, announce, full_text, image, user_id) VALUES
${articleValues};
ALTER TABLE articles ENABLE TRIGGER ALL;
ALTER TABLE article_categories DISABLE TRIGGER ALL;
INSERT INTO article_categories(article_id, category_id) VALUES
${articleCategoryValues};
ALTER TABLE article_categories ENABLE TRIGGER ALL;
ALTER TABLE comments DISABLE TRIGGER ALL;
INSERT INTO COMMENTS(text, user_id, article_id) VALUES
${commentValues};
ALTER TABLE comments ENABLE TRIGGER ALL;`;

    try {
      await fs.writeFile(FILE_NAME, content);
      console.log(chalk.green(`Operation success. File created.`));
      process.exit(ExitCode.success);
    } catch (err) {
      console.error(chalk.red(`Can't write data to file...`));
      process.exit(ExitCode.error);
    }
  }
};
