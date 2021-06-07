'use strict';

const Joi = require(`joi`);
const {UserMessage, User} = require(`../../const/shemas.const`);

module.exports = Joi.object({
  email: Joi.string()
    .email()
    .empty(``)
    .required()
    .messages({
      'string.email': UserMessage.VALID.EMAIL,
      'any.required': UserMessage.REQUIRED.EMAIL,
    }),

  firstname: Joi.string()
    .regex(/^[A-zА-я]+$/)
    .empty(``)
    .required()
    .messages({
      'string.pattern.base': UserMessage.VALID.FIRSTNAME,
      'any.required': UserMessage.REQUIRED.FIRSTNAME,
    }),

  lastname: Joi.string()
    .regex(/^[A-zА-я]+$/)
    .empty(``)
    .required()
    .messages({
      'string.pattern.base': UserMessage.VALID.LASTNAME,
      'any.required': UserMessage.REQUIRED.LASTNAME,
    }),

  password: Joi.string()
    .min(User.MIN_PASSWORD_LENGTH)
    .empty(``)
    .required()
    .messages({
      'string.min': UserMessage.MIN_PASSWORD_LENGTH,
      'any.required': UserMessage.REQUIRED.PASSWORD,
    }),

  repeat: Joi.string()
    .valid(Joi.ref(`password`))
    .min(User.MIN_PASSWORD_LENGTH)
    .empty(``)
    .required()
    .messages({
      'string.min': UserMessage.MIN_PASSWORD_LENGTH,
      'any.only': UserMessage.VALID.REPEAT,
      'any.required': UserMessage.REQUIRED.REPEAT,
    }),

  avatar: Joi.string()
    .empty(``),
});
