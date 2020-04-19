import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const storageFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  storageFolder,
  storage: multer.diskStorage({
    destination: storageFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
