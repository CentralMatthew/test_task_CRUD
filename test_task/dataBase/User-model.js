const mongoose_delete = require('mongoose-delete');

const { Schema, model } = require('mongoose');
const { dataBaseTableEnum } = require('../constants');

const userSchema = new Schema({
  age: {
    type: Number,
    default: 18
  },

  avatar: {
    type: Array,
    default: []
  },

  name: {
    type: String,
    required: true,
    max: 10
  },

  student: {
    type: Boolean
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  verifyToken: {
    type: String,
  },

  passwordToken: {
    type: String
  },

  gallery: {
    type: Array
  },

  documents: {
    type: Array
  },

  password: {
    type: String,
    required: true
  },

  isActivated: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });

userSchema.plugin(mongoose_delete, { deletedAt: true });

module.exports = model(dataBaseTableEnum.USERS, userSchema);
