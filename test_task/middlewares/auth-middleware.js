const { statusCode } = require('../constants');
const { OAuth, Users } = require('../dataBase');
const { headersConstant: { AUTHORIZATION } } = require('../constants');
const { ErrorHandler } = require('../errors');
const { authValidator } = require('../validators');
const {
  errorMessage: {
    NO_TOKEN, WRONG_TOKEN, INVALID_KEY_VALUE
  }
} = require('../errors');
const { authService, passwordHasher } = require('../services');
const { tokensConstant: { REFRESH, VERIFY_TOKEN } } = require('../constants');

module.exports = {
  checkLoginValidity: (req, res, next) => {
    try {
      const { error } = authValidator.logIn.validate(req.body);

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

  checkChangePasswordValidity: (req, res, next) => {
    try {
      const { error } = authValidator.changePassword.validate(req.body);

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

  checkAccessToken: async (req, res, next) => {
    try {
      const token = req.get(AUTHORIZATION);

      if (!token) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, NO_TOKEN.message, NO_TOKEN.code);
      }

      await authService.verifyToken(token);
      const findedUser = await OAuth.findOne({ accessToken: token });

      if (!findedUser) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, WRONG_TOKEN.message, WRONG_TOKEN.code);
      }

      req.user = findedUser.user;

      next();
    } catch (e) {
      next(e);
    }
  },

  checkRefreshToken: async (req, res, next) => {
    try {
      const token = req.get(AUTHORIZATION);

      if (!token) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, NO_TOKEN.message, NO_TOKEN.code);
      }

      await authService.verifyToken(token, REFRESH);

      const findedUser = await OAuth.findOne({ refreshToken: token });

      if (!findedUser) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, WRONG_TOKEN.message, WRONG_TOKEN.code);
      }

      req.user = findedUser.user;

      next();
    } catch (e) {
      next(e);
    }
  },

  checkVerificationToken: (tokenType = VERIFY_TOKEN) => async (req, res, next) => {
    try {
      const { verifyToken } = req.params;

      if (!verifyToken) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, NO_TOKEN.message, NO_TOKEN.code);
      }

      await authService.verifyVerificationToken(verifyToken, tokenType);

      const findedUser = await Users.findOne({ verifyToken });

      if (!findedUser) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, WRONG_TOKEN.message, WRONG_TOKEN.code);
      }
      req.user = findedUser;
      next();
    } catch (e) {
      next(e);
    }
  },

  activator: async (req, res, next) => {
    try {
      const { _id } = req.user;

      await Users.updateOne({ _id }, { isActivated: true });

      next();
    } catch (e) {
      next(e);
    }
  },

  checkPasswordToken: async (req, res, next) => {
    try {
      const { passwordToken } = req.params;

      if (!passwordToken) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, NO_TOKEN.message, NO_TOKEN.code);
      }

      await authService.verifyPasswordToken(passwordToken);

      const findedUser = await Users.findOne({ passwordToken });

      if (!findedUser) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, WRONG_TOKEN.message, WRONG_TOKEN.code);
      }

      req.user = findedUser;

      next();
    } catch (e) {
      next(e);
    }
  },

  passwordChanging: async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { newPassword } = req.params;

      const hashedPassword = await passwordHasher.hash(newPassword);

      await Users.updateOne({ _id }, { password: hashedPassword });

      next();
    } catch (e) {
      next(e);
    }
  },

};
