const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v1;
const { promisify } = require('util');

const { Users } = require('../dataBase');

const {
  statusCode,
  emailActionEnum: { REGISTRATION, UPDATE, DELETE },
  successResult: { SUCCESS_ADDED_PHOTO, SUCCESS_CHANGED_AVATAR, SUCCESS_ADDED_DOCUMENT }
} = require('../constants');

const { UPDATED } = require('../constants/successResults');

const {
  passwordHasher, mailService, userService, authService
} = require('../services');

const mkDirPromise = promisify(fs.mkdir);
const rmDirPromise = promisify(fs.rmdir);

module.exports = {

  getAllUsers: async (req, res, next) => {
    try {
      const users = await Users.find({}).lean();
      await users.forEach((user) => userService.userNormalizator(user));

      res.status(statusCode.OK).json(users);
    } catch (e) {
      next(e);
    }
  },

  getUserById: (req, res, next) => {
    try {
      const { user } = req;

      res.json(userService.userNormalizator(user));
    } catch (e) {
      next(e);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const {
        body: { password }
      } = req;
      const [avatar] = req.photos;

      const hashedPassword = await passwordHasher.hash(password);
      const { verifyToken } = await authService.generateVerificationToken();

      const user = await Users.create({
        ...req.body, password: hashedPassword, verifyToken
      });
      const { email, _id } = user;

      if (avatar) {
        const { finalPath, dirPath } = await _dirBuilder('photos', avatar.name, _id, 'users');
        await avatar.mv(finalPath);

        await Users.updateOne({ _id }, { $set: { avatar: dirPath } });
        await Users.updateOne({ _id }, { $push: { gallery: dirPath } });
      }

      const normalizedUser = userService.userNormalizator(user.toObject());

      await mailService.sendMail(email, REGISTRATION, { link: verifyToken });

      res.status(statusCode.CREATED).json(normalizedUser);
    } catch (e) {
      next(e);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { email, name, } = req.user;

      const user = await Users.findById({ _id: userId });

      user.delete();

      await mailService.sendMail(email, DELETE, { userName: name });

      await _dirRemover(userId, 'users');

      res.status(statusCode.NO_CONTENT).json('Success').end();
    } catch (e) {
      next(e);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { email, name } = req.user;

      await Users.findByIdAndUpdate(userId, req.body);

      await mailService.sendMail(email, UPDATE, { userName: name });

      res.status(statusCode.CREATED).json(UPDATED);
    } catch (e) {
      next(e);
    }
  },

  getAllUserPhotos: (req, res, next) => {
    try {
      const { gallery } = req.user;

      res.status(statusCode.UPDATED).json(gallery);
    } catch (e) {
      next(e);
    }
  },

  getUserDocuments: (req, res, next) => {
    try {
      const { documents } = req.user;

      res.status(statusCode.UPDATED).json(documents);
    } catch (e) {
      next(e);
    }
  },

  changeUserAvatar: async (req, res, next) => {
    try {
      const [avatar] = req.photos;
      const { _id } = req.user;

      if (avatar) {
        const { finalPath, dirPath } = await _dirBuilder('photos', avatar.name, _id, 'users');

        await avatar.mv(finalPath);

        await Users.updateOne({ _id }, { $set: { avatar: dirPath } });
        await Users.updateOne({ _id }, { $push: { gallery: dirPath } });
      }

      res.status(statusCode.UPDATED).json(SUCCESS_CHANGED_AVATAR);
    } catch (e) {
      next(e);
    }
  },

  addPhotoToGallery: async (req, res, next) => {
    try {
      const photo = req.photos;
      const { _id } = req.user;

      const photoArr = [];

      if (photo.length) {
        for await (const image of photo) {
          const { finalPath, dirPath } = await _dirBuilder('photos', image.name, _id, 'users');

          await image.mv(finalPath);

          photoArr.push(dirPath);
        }

        await Users.updateOne({ _id }, { $push: { gallery: { $each: photoArr } } });
      }

      res.status(statusCode.UPDATED).json(SUCCESS_ADDED_PHOTO);
    } catch (e) {
      next(e);
    }
  },

  addUserDocument: async (req, res, next) => {
    try {
      const [document] = req.documents;
      const { _id } = req.user;

      if (document) {
        const { finalPath, dirPath } = await _dirBuilder('documents', document.name, _id, 'users');
        await document.mv(finalPath);

        await Users.updateOne({ _id }, { $push: { documents: dirPath } });
      }

      res.status(statusCode.UPDATED).json(SUCCESS_ADDED_DOCUMENT);
    } catch (e) {
      next(e);
    }
  }

};

async function _dirBuilder(dirName, fileName, itemdId, itemType) {
  const pathWithoutStatic = path.join(itemType, itemdId.toString(), dirName);
  const uploadPath = path.join(process.cwd(), 'static', pathWithoutStatic);

  const fileExtension = fileName.split('.').pop();
  const newFileName = `${uuid()}.${fileExtension}`;
  const finalPath = path.join(uploadPath, newFileName);

  await mkDirPromise(uploadPath, { recursive: true });

  return {
    finalPath,
    dirPath: path.join(pathWithoutStatic, newFileName)
  };
}

async function _dirRemover(itemdId, itemType) {
  const pathWithoutStatic = path.join(itemType, itemdId.toString());
  const uploadPath = path.join(process.cwd(), 'static', pathWithoutStatic);
  await rmDirPromise(uploadPath, { recursive: true });
}
