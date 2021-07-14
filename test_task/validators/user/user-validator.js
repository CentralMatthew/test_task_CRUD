const Joi = require('joi');

const { regexp } = require('../../constants');

module.exports = {
  createUser: Joi.object().keys({
    avatar: Joi.string(),
    document: Joi.array(),
    gallery: Joi.array(),
    name: Joi.string().required().min(2).max(40),
    email: Joi.string().regex(regexp.EMAIL_REGEXP).required(),
    password: Joi.string().regex(regexp.PASSWORD_REGEXP).required(),
    age: Joi.number().min(1).max(150),
    student: Joi.boolean()
  }),

  updateUser: Joi.object().keys({
    avatar: Joi.array(),
    document: Joi.array(),
    gallery: Joi.array(),
    name: Joi.string().min(2).max(40),
    age: Joi.number().min(1).max(150),
    student: Joi.boolean()
  })
};
