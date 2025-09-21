const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    if (req.uploadType === 'profile') {
      uploadPath += 'profile_pictures/';
    } else if (req.uploadType === 'construction') {
      uploadPath += 'construction_sites/';
    }

    // ✅ Vérifie si le dossier existe, sinon crée-le
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.uploadType}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté (Uniquement des images)'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const setUploadType = type => (req, res, next) => {
  req.uploadType = type;
  next();
};

module.exports = { upload, setUploadType };
