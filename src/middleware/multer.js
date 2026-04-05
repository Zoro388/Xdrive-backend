import multer from "multer";

// Memory storage for Cloudinary
const storage = multer.memoryStorage();

// Allowed MIME types (images + videos)
const allowedTypes = [
 "image/jpeg",
 "image/png",
 "image/jpg",
 "image/gif",
 "image/webp",
 "image/svg+xml",
 "video/mp4",
 "video/mov",
 "video/avi",
 "video/mkv",
 "video/webm",
];

// Multer instance
const upload = multer({
 storage,
 fileFilter: (req, file, cb) => {
 if (allowedTypes.includes(file.mimetype)) {
 cb(null, true);
 } else {
 cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
 }
 },
 limits: {
 fileSize: 80 * 1024 * 1024, // max 80MB for any file
 },
});

// Middleware to check per-type size (optional but safer)
const checkFileSize = (req, res, next) => {
 if (!req.files) return next();

 for (const file of req.files) {
 if (file.mimetype.startsWith("image/") && file.size > 6 * 1024 * 1024) {
 return res
 .status(400)
 .json({ message: `Image ${file.originalname} exceeds 6MB` });
 }
 if (file.mimetype.startsWith("video/") && file.size > 80 * 1024 * 1024) {
 return res
 .status(400)
 .json({ message: `Video ${file.originalname} exceeds 80MB` });
 }
 }

 next();
};

export { upload, checkFileSize };