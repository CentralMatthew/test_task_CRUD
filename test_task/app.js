const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { unknownErrors, statusCode } = require('./constants');
const { dataBase } = require('./constants/dbUrl');
const { PORT } = require('./constants/port');
const { userRouter, authRouter } = require('./routes');

const app = express();

const staticDir = path.join(__dirname, 'static');

_moongoseConnector();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(staticDir));

app.use(fileUpload({}));
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use(_handleErrors);
app.use('*', _notFoundHandler);

app.listen(PORT, () => {
  console.log(`App listen ${PORT}`);
});

// eslint-disable-next-line no-unused-vars
function _handleErrors(err, req, res, next) {
  res
    .status(err.status)
    .json({
      message: err.message || unknownErrors.UNKNOWN_ERROR,
      customCode: err.code || unknownErrors.UNKNOWN_STATUS
    });
}

function _notFoundHandler(err, req, res, next) {
  next({
    status: err.status || statusCode.NOT_FOUND,
    message: err.message || unknownErrors.ROUTE_NOT_FOUND
  });
}

function _moongoseConnector() {
  mongoose.connect(dataBase, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
}
