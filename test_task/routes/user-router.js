const router = require('express').Router();

const { userController } = require('../controllers');
const {
  userMiddleware: {
    checkUserValidity, getUserByDynamicParam, isEmailBusy, checkUserUpdateValidity
  },
  authMiddleware: { checkAccessToken },
  fileMiddleware: { checkFiles, checkAvatar }
} = require('../middlewares');

router.get('/', userController.getAllUsers);

router.post('/',
  checkFiles,
  checkAvatar,
  checkUserValidity,
  isEmailBusy,
  userController.createUser);

router.use('/:userId', getUserByDynamicParam('userId', 'params', '_id'));

router.get('/:userId', userController.getUserById);

router.delete('/:userId', checkAccessToken ,userController.deleteUser);

router.patch('/:userId',
    checkAccessToken,
    checkUserUpdateValidity,
    userController.updateUser
);

router.get('/:userId/photos', userController.getAllUserPhotos);

router.get('/:userId/documents', userController.getUserDocuments);

router.post('/:userId/avatar', checkFiles, checkAccessToken, userController.changeUserAvatar);

router.post('/:userId/photos', checkFiles,checkAccessToken, userController.addPhotoToGallery);

router.post('/:userId/documents', checkFiles,checkAccessToken , userController.addUserDocument);

module.exports = router;
