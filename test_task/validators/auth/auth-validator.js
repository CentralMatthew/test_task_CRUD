const Joi = require('joi');

const { regexp } = require('../../constants');

module.exports = {
  logIn: Joi.object().keys({
    email: Joi.string().regex(regexp.EMAIL_REGEXP).required(),
    password: Joi.string().regex(regexp.PASSWORD_REGEXP).required()
  }),

  changePassword: Joi.object().keys({
    email: Joi.string().regex(regexp.EMAIL_REGEXP).required(),
    newPassword: Joi.string().regex(regexp.PASSWORD_REGEXP).required()
  })
};
