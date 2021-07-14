module.exports = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN || 'Secret',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN || 'This too secret for you',
  VERIFY_TOKEN_SECRET: process.env.VERIFY_TOKEN || 'verify token',
  PASSWORD_CHANGE_TOKEN_SECRET: process.env.VERIFY_TOKEN || 'change password token'
};
