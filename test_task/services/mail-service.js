const nodemailer = require('nodemailer');
const EmailTemplates = require('email-templates');
const path = require('path');

const { statusCode } = require('../constants');
const {
  mailConstant: {
    SYSTEM_EMAIL, SYSTEM_EMAIL_PASSWORD, FROM, GMAIL_SERVICE
  }
} = require('../constants');
const { ErrorHandler, errorMessage: { WRONG_TEMPLATE } } = require('../errors');
const templateInfo = require('../email-templates');

const templateParser = new EmailTemplates({
  views: {
    root: path.join(process.cwd(), 'email-templates')
  }
});

const transporter = nodemailer.createTransport({
  service: GMAIL_SERVICE,
  auth: {
    user: SYSTEM_EMAIL,
    pass: SYSTEM_EMAIL_PASSWORD
  }
});

const sendMail = async (userMail, action, context = {}) => {
  const templateToSend = templateInfo[action];

  if (!templateToSend) {
    throw new ErrorHandler(statusCode.BAD_REQUEST, WRONG_TEMPLATE.message, WRONG_TEMPLATE.code);
  }

  const html = await templateParser.render(templateToSend.templateName, context);

  return transporter.sendMail({
    from: FROM,
    to: userMail,
    subject: templateInfo.subject,
    html
  });
};

module.exports = {
  sendMail
};
