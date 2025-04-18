const multer = require("multer");
const path = require("path");

// Définir le stockage dynamique en fonction du type d'image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = "uploads/";

        if (req.uploadType === "profile") {
            uploadPath += "profile_pictures/";
        } else if (req.uploadType === "construction") {
            uploadPath += "construction_sites/";
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${req.uploadType}-${Date.now()}${ext}`); // Nom unique basé sur le type d'upload
    }
});

// Filtrer les fichiers (accepter uniquement les images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Format non supporté (Uniquement des images)"), false);
    }
};

// Middleware `upload` avec limite de taille (2MB max)
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Middleware dynamique pour définir le type d'upload
const setUploadType = (type) => (req, res, next) => {
    req.uploadType = type;
    next();
};

module.exports = { upload, setUploadType };