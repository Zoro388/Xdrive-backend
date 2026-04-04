import multer from "multer";

// Memory storage (needed for Cloudinary)
const storage = multer.memoryStorage();

// Allowed file types
const imageTypes = ["image/jpeg", "image/png", "image/jpg"];
const videoTypes = ["video/mp4", "video/mov", "video/avi"];

// Multer instance
const upload = multer({
 storage,
 fileFilter: (req, file, cb) => {
 if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
 cb(null, true);
 } else {
 cb(new Error("Unsupported file type"), false);
 }
 },
 limits: {
 fileSize: 80 * 1024 * 1024, // 80MB max for videos (highest limit)
 },
});

// Middleware to check per-type size
const checkFileSize = (req, res, next) => {
 if (!req.files) return next();

 for (const file of req.files) {
 if (file.mimetype.startsWith("image/") && file.size > 6 * 1024 * 1024) {
 return res.status(400).json({ message: `Image ${file.originalname} exceeds 6MB` });
 }
 if (file.mimetype.startsWith("video/") && file.size > 80 * 1024 * 1024) {
 return res.status(400).json({ message: `Video ${file.originalname} exceeds 80MB` });
 }
 }

 next();
};

export { upload, checkFileSize };