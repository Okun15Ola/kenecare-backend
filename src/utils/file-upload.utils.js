const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const mediaUploadDirectory = path.join(__dirname, "../public/upload/media/");

const profileUploadDirectory = path.join(
  __dirname,
  "../public/upload/profile_pics/"
);

const directories = [mediaUploadDirectory, profileUploadDirectory];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const allowedExtension = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const allowedMimetypes = filetypes.test(file.mimetype);
  if (allowedExtension && allowedMimetypes) {
    return cb(null, true);
  } else {
    const error = new Error("Invalid File Type");
    error.code = "INVALID_FILE_TYPE";
    error.message =
      "INVALID FILE TYPE. Expected File Type: *.jpeg | *.jpg | *.png | *.pdf.";
    cb(error, false);
  }
};

const AWSUploader = multer({
  fileFilter: fileFilter,
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
    fieldSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

const localMediaUploader = multer({
  storage: localMediaStore,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
const localProfilePicUploader = multer({
  storage: localProfilePictureStore,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const generateUniqueFileName = (file, cb) => {
  crypto.randomBytes(16, (err, raw) => {
    if (err) return cb(err);

    const randomName = raw.toString("hex");
    const fileExtension = path.extname(file.originalname);

    const uniqueFileName = randomName + fileExtension;

    cb(null, uniqueFileName);
  });
};
const generateFileName = (file) => {
  const buffer = crypto.randomBytes(16);
  const randomString = buffer.toString("hex");
  const fileExtension = path.extname(file.originalname);
  return randomString + fileExtension;
};

const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted");
    } else {
      console.log("File Not Found");
    }
  } catch (error) {
    console.log("FILE_DELETE_ERROR", error);
    throw error;
  }
};

module.exports = {
  localMediaUploader,
  localProfilePicUploader,
  AWSUploader,
  generateFileName,
  tempUpload,
  deleteFile,
};
