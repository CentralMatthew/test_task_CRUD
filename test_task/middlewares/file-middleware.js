const {
  mimeType: {
    DOCS_MIMETYPES,
    VIDEOS_MIMETYPES,
    PHOTOS_MIMETYPES,
    DOC_MAX_SIZE,
    VIDEO_MAX_SIZE,
    PHOTO_MAX_SIZE
  }
} = require('../constants');
const { ErrorHandler, errorMessage: { WRONG_FILE_FORMAT, FILESIZE_TOO_BIG, ONLY_ONE_AVATAR_FOR_USER } } = require('../errors');
const { statusCode } = require('../constants');

module.exports = {
  checkFiles: (req, res, next) => {
    try {
      const files = Object.values(req.files);

      const documents = [];
      const photos = [];
      const videos = [];

      for (let i = 0; i < files.length; i++) {
        const { size, mimetype } = files[i];

        if (PHOTOS_MIMETYPES.includes(mimetype)) {
          if (size > PHOTO_MAX_SIZE) {
            throw new ErrorHandler(statusCode.PAYLOAD_TOO_LARGE, FILESIZE_TOO_BIG.message, FILESIZE_TOO_BIG.code);
          }

          photos.push(files[i]);
        } else if (VIDEOS_MIMETYPES.includes(mimetype)) {
          if (size > VIDEO_MAX_SIZE) {
            throw new ErrorHandler(statusCode.PAYLOAD_TOO_LARGE, FILESIZE_TOO_BIG.message, FILESIZE_TOO_BIG.code);
          }

          videos.push(files[i]);
        } else if (DOCS_MIMETYPES.includes(mimetype)) {
          if (size > DOC_MAX_SIZE) {
            throw new ErrorHandler(statusCode.PAYLOAD_TOO_LARGE, FILESIZE_TOO_BIG.message, FILESIZE_TOO_BIG.code);
          }

          documents.push(files[i]);
        } else {
          throw new ErrorHandler(statusCode.UNSUPPORTED_MEDIA, WRONG_FILE_FORMAT.message, WRONG_FILE_FORMAT.code);
        }
      }

      req.documents = documents;
      req.photos = photos;
      req.videos = videos;

      next();
    } catch (e) {
      next(e);
    }
  },

  checkAvatar: (req, res, next) => {
    try {
      if (req.photos.length > 1) {
        throw new ErrorHandler(statusCode.FORBIDDEN, ONLY_ONE_AVATAR_FOR_USER.message, ONLY_ONE_AVATAR_FOR_USER.code);
      }

      [req.avatar] = req.photos;

      next();
    } catch (e) {
      next(e);
    }
  },

};
