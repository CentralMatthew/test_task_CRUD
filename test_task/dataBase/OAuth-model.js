const { Schema, model } = require('mongoose');
const { dataBaseTableEnum } = require('../constants');

const oAuthSchema = new Schema({
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  verifyToken: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: dataBaseTableEnum.USERS
  },
}, { timestamps: true });

oAuthSchema.pre('findOne', function() {
  this.populate('user');
});

module.exports = model(dataBaseTableEnum.O_AUTH, oAuthSchema);
