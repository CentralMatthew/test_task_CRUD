const { OAuth, Users } = require('../dataBase');
const { passwordHasher, authService, mailService } = require('../services');
const { ErrorHandler } = require('../errors');
const {
  statusCode, successResult, headersConstant: { AUTHORIZATION }, emailActionEnum: { WELCOME, CHANGE_PASSWORD }
} = require('../constants');
const {
  errorMessage: {
    EMAIL_NOT_VERIFIED
  }
} = require('../errors');

module.exports = {

  login: async (req, res, next) => {
    try {
      const {
        password: hashedPassword, _id, email, name, isActivated, verifyToken
      } = req.user;
      const { password } = req.body;

      if (!isActivated) {
        throw new ErrorHandler(statusCode.UNAUTHORIZED, EMAIL_NOT_VERIFIED.message, EMAIL_NOT_VERIFIED.code);
      }

      await passwordHasher.compare(hashedPassword, password);

      await mailService.sendMail(email, WELCOME, { userName: name });

      const tokenPair = await authService.generateTokenPair();

      await OAuth.create({
        verifyToken,
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: _id
      });

      res.json({
        ...tokenPair,
        user: req.user
      });
    } catch (e) {
      next(e);
    }
  },

  logout: async (req, res, next) => {
    try {
      const token = req.get(AUTHORIZATION);

      await OAuth.remove({ accessToken: token });

      res.status(statusCode.NO_CONTENT).json(successResult.SUCCESS_LOG_OUT);
    } catch (e) {
      next(e);
    }
  },

  activateUser: (req, res, next) => {
    try {
      res.json(successResult.SUCCESS_ACTIVATE);
    } catch (e) {
      next(e);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { email, newPassword } = req.body;

      const { passwordToken: pass } = await authService.generatePasswordChangeToken();

      await Users.updateOne({ email }, { passwordToken: pass });

      const user = await Users.findOne({ email });

      await mailService.sendMail(user.email, CHANGE_PASSWORD,
        {
          userName: user.name,
          link: user.passwordToken,
          password: newPassword
        });

      res.status(statusCode.OK).json(successResult.CHECK_EMAIL);
    } catch (e) {
      next(e);
    }
  },

  setNewPassword: (req, res, next) => {
    try {
      res.status(statusCode.OK).json(successResult.SUCCESS_CHANGE_PASSWORD);
    } catch (e) {
      next(e);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.get(AUTHORIZATION);

      const tokenPair = authService.generateTokenPair();

      await OAuth.findOneAndUpdate({ refreshToken }, { ...tokenPair });

      res.json({
        ...tokenPair,
        user: req.user
      });

      res.status(statusCode.OK).json(successResult.SUCCESS_REFRESH);
    } catch (e) {
      next(e);
    }
  }
};
