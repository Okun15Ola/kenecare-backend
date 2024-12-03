const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const logger = require("../middlewares/logger.middleware");

const mediaUploadDirectory = path.join(__dirname, "../public/upload/media/");

const profileUploadDirectory = path.join(
  __dirname,
  "../public/upload/profile_pics/",
);

const generateUniqueFileName = (file, cb) => {
  crypto.randomBytes(16, (err, raw) => {
    if (err) return cb(err);

    const randomName = raw.toString("hex");
    const fileExtension = path.extname(file.originalname);

    const uniqueFileName = randomName + fileExtension;

    return cb(null, uniqueFileName);
  });
};
const generateFileName = (file) => {
  const buffer = crypto.randomBytes(16);
  const randomString = buffer.toString("hex");
  const fileExtension = path.extname(file.originalname);
  return randomString + fileExtension;
};

const directories = [mediaUploadDirectory, profileUploadDirectory];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const allowedExtension = filetypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const fileSize = req.headers["content-length"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const allowedMimetypes = filetypes.test(file.mimetype);
  if (allowedExtension && allowedMimetypes) {
    //  Check the file size
    if (fileSize <= MAX_FILE_SIZE) return cb(null, true);

    const error = new Error("Uploaded file exceeds the 10MB limit");
    error.code = "FILE_TOO_LARGE";
    return cb(error, false);
  }
  const error = new Error(
    "Invalid file type. Expected types: .jpeg, .jpg, .png, .pdf.",
  );

  error.code = "INVALID_FILE_TYPE";
  return cb(error, false);
};

const AWSUploader = multer({
  fileFilter,
  storage: multer.memoryStorage(),
});

const localMediaStore = multer.diskStorage({
  destination: mediaUploadDirectory,
  filename: (req, file, cb) => {
    generateUniqueFileName(file, cb);
  },
});
const localProfilePictureStore = multer.diskStorage({
  destination: profileUploadDirectory,
  filename: (req, file, cb) => {
    generateUniqueFileName(file, cb);
  },
});

const tempUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

const localMediaUploader = multer({
  storage: localMediaStore,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});
const localProfilePicUploader = multer({
  storage: localProfilePictureStore,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted Successfully");
    }
  } catch (error) {
    logger.error("FILE_DELETE_ERROR", error);
    throw error;
  }
};

const encryptFile = ({ buffer, password }) => {
  const cipher = crypto.createCipher("aes-256-ctr", password);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
};

const decryptFile = ({ buffer, password }) => {
  const decipher = crypto.createDecipher("aes-256-ctr", password);
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
};

module.exports = {
  localMediaUploader,
  localProfilePicUploader,
  AWSUploader,
  generateFileName,
  tempUpload,
  deleteFile,
  encryptFile,
  decryptFile,
};
