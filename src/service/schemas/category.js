'use strict';

const Joi = require(`joi`);
const {Category, CategoryMessage} = require(`../../const/shemas.const`);

module.exports = Joi.object({

  name: Joi.string()
    .min(Category.MIN_LENGTH)
    .max(Category.MAX_LENGTH)
    .empty(``)
    .required()
    .messages({
      'string.min': CategoryMessage.MIN_TEXT_LENGTH,
      'string.max': CategoryMessage.MAX_TEXT_LENGTH,
      'any.required': CategoryMessage.REQUIRED,
    }),
});
