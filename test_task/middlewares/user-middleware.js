const { Users } = require('../dataBase');
const { ErrorHandler } = require('../errors');
const { USER_NOT_FOUND, EMAIL_IS_NOT_AVAILABLE, INVALID_KEY_VALUE } = require('../errors/error-message');
const { statusCode } = require('../constants');
const { userValidator } = require('../validators');

module.exports = {

  isEmailBusy: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ email });

      if (user) {
        throw new ErrorHandler(
          statusCode.CONFLICT,
          EMAIL_IS_NOT_AVAILABLE.message,
          EMAIL_IS_NOT_AVAILABLE.code
        );
      }

      next();
    } catch (e) {
      next(e);
    }
  },

  checkUserValidity: (req, res, next) => {
    try {
      const { error } = userValidator.createUser.validate(req.body);

      if (error) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          error.details[0].message,
          INVALID_KEY_VALUE.code
        );
      }

      next();
    } catch (e) {
      next(e);
    }
  },

  checkUserUpdateValidity: (req, res, next) => {
    try {
      const { error } = userValidator.updateUser.validate(req.body);

      if (error) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          error.details[0].message,
          INVALID_KEY_VALUE.code
        );
      }

      next();
    } catch (e) {
      next(e);
    }
  },

  getUserByDynamicParam: (paramName, searchIn = 'body', dbKey = paramName) => async (req, res, next) => {
    try {
      const valueOfParams = req[searchIn][paramName];

      const user = await Users.findOne({ [dbKey]: valueOfParams }).select('+password').lean();

      if (!user) {
        throw new ErrorHandler(
          statusCode.NOT_FOUND,
          USER_NOT_FOUND.message,
          USER_NOT_FOUND.code
        );
      }

      req.user = user;

      next();
    } catch (e) {
      next(e);
    }
  }

};
