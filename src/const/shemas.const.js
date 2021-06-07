'use strict';

const Article = {
  MIN_TITLE_LENGTH: 30,
  MAX_TITLE_LENGTH: 250,
  MIN_ANNOUNCE_LENGTH: 30,
  MAX_ANNOUNCE_LENGTH: 250,
  MAX_TEXT_LENGTH: 1000,
  MIN_CATEGORIES_LENGTH: 1
};

const Comment = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 1000,
};

const Category = {
  MIN_LENGTH: 5,
  MAX_LENGTH: 30,
};

const User = {
  MIN_PASSWORD_LENGTH: 6,
};

const ArticleMessage = {

  REQUIRED: {
    TITLE: `Укажите название статьи`,
    ANNOUNCE: `Заполните описание статьи`,
    CATEGORIES: `Выберите хотя бы одну категорию`,
    DATE: `Выберите дату`,
  },
  VALID: {
    CATEGORIES: `Выбрана несуществующая категория`,
    DATE: `Неверный формат даты`
  },
  MIN_TITLE_LENGTH: `Заголовок должен быть не меньше 30 символов`,
  MAX_TITLE_LENGTH: `Заголовок должен быть не больше 250 символов`,
  MIN_ANNOUNCE_LENGTH: `Описание должно быть не меньше 30 символов`,
  MAX_ANNOUNCE_LENGTH: `Описание должно быть не больше 250 символов`,
  MAX_FULL_TEXT_LENGTH: `Текст статьи не можеты быть больше 1000 символов`,
};

const CommentMessage = {
  REQUIRED: `Сообщение не может быть пустым, напишите что-нибудь!`,
  MIN_TEXT_LENGTH: `Текст комментария должен быть не меньше 20 символов`,
  MAX_TEXT_LENGTH: `Текст объявления должен быть не больше 1000 символов`,
};

const CategoryMessage = {
  REQUIRED: `Введите название категории`,
  MIN_TEXT_LENGTH: `Название категории должно быть не меньше 5 символов`,
  MAX_TEXT_LENGTH: `Название категории должно быть не больше 30 символов`,
  HAS_ARTICLES: `Вы не можете удалить категорию, в которой уже есть статьи`,
  NAME_ALREADY_EXISTS: `Категория с таким названием уже существует`
};

const UserMessage = {

  REQUIRED: {
    EMAIL: `Укажите ваш e-mail`,
    FIRSTNAME: `Укажите ваше имя`,
    LASTNAME: `Укажите вашу фамилию`,
    PASSWORD: `Введите пароль`,
    REPEAT: `Введите пароль ещё раз`,
  },
  VALID: {
    EMAIL: `E-mail не валиден. Введите валидный адре электронной почты`,
    FIRSTNAME: `Имя может содержать только буквы и не должно включать пробелы`,
    LASTNAME: `Фамилия может содержать только буквы и не должна включать пробелы`,
    REPEAT: `Пароли не совпадают. Проверьте введённые данные`
  },
  MIN_PASSWORD_LENGTH: `Пароль должен быть не меньше 6 символов`,
  EMAIL_ALREADY_REGISTERED: `Пользователь с таким электронным адресом уже зарегистрирован`
};

const LoginMessage = {

  REQUIRED: {
    EMAIL: `Укажите ваш e-mail`,
    PASSWORD: `Введите пароль`,
  },
  EMAIL_NOT_VALID: `E-mail не валиден. Введите валидный адре электронной почты`,
  EMAIL_NOT_REGISTERED: `Пользователь с таким электронным адресом не зарегистрирован`,
  WRONG_PASSWORD: `Неверный пароль`
};

module.exports = {Article, Comment, Category, User, ArticleMessage, CommentMessage, CategoryMessage, UserMessage, LoginMessage};
