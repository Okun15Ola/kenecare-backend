const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

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
    error.code = 400;
    error.message =
      "Invalid file type. Please upload a JPEG, JPG, PNG, or PDF file.";
    cb(error, false);
  }
};

const AWSUploader = multer({
  fileFilter: fileFilter,
  storage: multer.memoryStorage(),
});

const localMediaStore = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.body);
    cb(null, path.join(__dirname, "../public/upload/media/"));
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(file, cb);
  },
});
const localProfilePictureStore = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.body);
    cb(null, path.join(__dirname, "../public/upload/profile_pics/"));
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(file, cb);
  },
});

const tempUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 1024 * 1024 * 2,
  },
  fileFilter,
});

const localMediaUploader = multer({
  storage: localMediaStore,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: fileFilter,
});
const localProfilePicUploader = multer({
  storage: localProfilePictureStore,
  limits: {
    fileSize: 1024 * 1024 * 2,
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

module.exports = {
  localMediaUploader,
  localProfilePicUploader,
  AWSUploader,
  generateFileName,
  tempUpload,
};
