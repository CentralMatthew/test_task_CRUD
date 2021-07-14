const router = require('express').Router();

const { authController } = require('../controllers');
const { userMiddleware, authMiddleware } = require('../middlewares');

router.post('/login',
  authMiddleware.checkLoginValidity,
  userMiddleware.getUserByDynamicParam('email'),
  authController.login);

router.post('/logout',
  authMiddleware.checkAccessToken,
  authController.logout);

router.post('/refresh', authMiddleware.checkRefreshToken, authController.refresh);

router.get('/activate/:verifyToken',
  authMiddleware.checkVerificationToken(),
  authMiddleware.activator,
  authController.activateUser);

router.get('/changePassword', authMiddleware.checkChangePasswordValidity, authController.changePassword);

router.get('/refreshPassword/:passwordToken/:newPassword',
  authMiddleware.checkPasswordToken,
  authMiddleware.passwordChanging,
  authController.setNewPassword);

module.exports = router;
