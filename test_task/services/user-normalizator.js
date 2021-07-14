module.exports = {
  userNormalizator: (userToNormalize = {}) => {
    const fieldsToRemove = ['password'];

    fieldsToRemove.forEach((field) => {
      delete userToNormalize[field];
    });

    return userToNormalize;
  }
};
