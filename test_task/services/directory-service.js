const path = require('path')
const { promisify } = require('util');
const fs = require('fs');
const uuid = require('uuid').v1;

const mkDirPromise = promisify(fs.mkdir);
const rmDirPromise = promisify(fs.rmdir);

module.exports = {
    _dirBuilder: async  (dirName, fileName, itemdId, itemType) => {
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
    },

    _dirRemover: async (itemdId, itemType) => {
        const pathWithoutStatic = path.join(itemType, itemdId.toString());
        const uploadPath = path.join(process.cwd(), 'static', pathWithoutStatic);
        await rmDirPromise(uploadPath, { recursive: true });
    }

}