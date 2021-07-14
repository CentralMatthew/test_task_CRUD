const {
  emailActionEnum: {
    WELCOME, CHANGE_PASSWORD, REGISTRATION, UPDATE, DELETE
  }
} = require('../constants');

module.exports = {
  [WELCOME]: {
    templateName: 'welcome',
    subject: 'Welcome on table'
  },
  [CHANGE_PASSWORD]: {
    templateName: 'changePassword',
    subject: 'Password changing'
  },
  [REGISTRATION]: {
    templateName: 'registration',
    subject: 'You are was successful register'
  },
  [UPDATE]: {
    templateName: 'updateInfo',
    subject: 'You are was successful update info'
  },
  [DELETE]: {
    templateName: 'deleteUser',
    subject: 'You are was delete account'
  }
};
