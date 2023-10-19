const multer = require("multer");
const path = require("path");
const crypto = require("crypto")
const {Validate} = require("../validations/validate")

const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../public/upload/blogs/"))
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(req,file,cb)
  }
})

exports.blogImageUploader = multer({
  storage: blogImageStorage,
  limits: {
    fileSize:1024*1024*2
  },
  fileFilter:fileFilter
})
const servicesImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../public/upload/services/"))
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(req,file,cb)
  }
})
exports.servicesImageUploader = multer({
  storage: servicesImageStorage,
  limits: {
    fileSize:1024*1024*2
  },
  fileFilter:fileFilter
})
const specializationsImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../public/upload/sepecializations/"))
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(req,file,cb)
  }
})
exports.specializationsImageUploader = multer({
  storage: specializationsImageStorage,
  limits: {
    fileSize:1024*1024*2
  },
  fileFilter:fileFilter
})
const specialtiesImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../public/upload/specialties/"))
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(req,file,cb)
  }
})
exports.specialtiesImageUploader = multer({
  storage: specialtiesImageStorage,
  limits: {
    fileSize:1024*1024*2
  },
  fileFilter:fileFilter
})
const patientMedicalDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../public/upload/medicalrecords/"))
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(req,file,cb)
  }
})
exports.patientMedicalDocumentUploader = multer({
  storage: patientMedicalDocumentStorage,
  limits: {
    fileSize:1024*1024*2
  },
  fileFilter:fileFilter
})
const patientDoctorProfileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../public/upload/profile/"))
  },
  filename: (req, file, cb) => {
    generateUniqueFileName(req,file,cb)
  }
});
exports.patientDoctorProfileUploader = multer({
  storage: patientDoctorProfileStorage,
  limits: {
    fileSize:1024*1024*2
  },
  fileFilter:fileFilter
})

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const allowedExtension = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const allowedMimetypes = filetypes.test(file.mimetype);
  if (allowedExtension && allowedMimetypes) {
    return cb(null, Validate);
  } else {
    cb(null, false);
  }
}


const generateUniqueFileName = (req, file,cb) => {
  try {
    crypto.randomBytes(16,(err,raw) => {
      if (err) return cb(err)

      const randomName = raw.toString("hex")
      const fileExtension = path.extname(file.originalname)

      const uniqueFileName = randomName + fileExtension
      
      cb(null, uniqueFileName);
    })
  } catch (error) {
    console.error(error)
    throw error;
  }
}