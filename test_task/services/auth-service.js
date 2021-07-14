const util = require('util');
const jwt = require('jsonwebtoken');

const verifyPromisify = util.promisify(jwt.verify);

const {
  tokensConstant: {
    ACCESS, EXPIRES_FOR_ACCESS, EXPIRES_FOR_REFRESH, VERIFY_TOKEN, PASSWORD_TOKEN
  },
  tokens: {
    ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, VERIFY_TOKEN_SECRET, PASSWORD_CHANGE_TOKEN_SECRET
  }
} = require('../constants');

module.exports = {
  generateTokenPair: () => {
    const accessToken = jwt.sign({}, ACCESS_TOKEN_SECRET, { expiresIn: EXPIRES_FOR_ACCESS });
    const refreshToken = jwt.sign({}, REFRESH_TOKEN_SECRET, { expiresIn: EXPIRES_FOR_REFRESH });

    return {
      accessToken,
      refreshToken
    };
  },

  generateVerificationToken: () => {
    const verifyToken = jwt.sign({}, VERIFY_TOKEN_SECRET, { expiresIn: EXPIRES_FOR_ACCESS });

    return {
      verifyToken
    };
  },

  generatePasswordChangeToken: () => {
    const passwordToken = jwt.sign({}, PASSWORD_CHANGE_TOKEN_SECRET, { expiresIn: EXPIRES_FOR_REFRESH });

    return {
      passwordToken
    };
  },

  verifyToken: async (token, tokenType = ACCESS) => {
    const secretWord = tokenType === ACCESS ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
    console.log(secretWord);

    await verifyPromisify(token, secretWord);
  },

  verifyVerificationToken: async (token, tokenType = VERIFY_TOKEN) => {
    await verifyPromisify(token, VERIFY_TOKEN_SECRET, tokenType);
  },

  verifyPasswordToken: async (token, tokenType = PASSWORD_TOKEN) => {
    await verifyPromisify(token, PASSWORD_CHANGE_TOKEN_SECRET, tokenType);
  }

};
