const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "libraryos/digital-resources",
    allowed_formats: ["pdf", "epub", "docx", "doc", "jpg", "png"], // Cloudinary converts PDFs to images for thumbnails!
    resource_type: "auto", // Allows PDFs (which are raw/image hybrids in cloudinary)
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (Cloudinary free tier limit)
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "application/epub+zip", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, EPUB, DOCX, and images are allowed."));
    }
  }
});

exports.uploadMiddleware = upload.single("file");

exports.getFileUrl = (file) => {
  // We will return the Cloudinary secure_url
  return file.secure_url;
};
