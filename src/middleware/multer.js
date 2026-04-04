// src/middleware/multer.js
import multer from "multer";

// Store files in memory before sending to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
storage,
limits: { files: 3 }, // maximum 3 files per upload
fileFilter: (req, file, cb) => {
if (
file.mimetype.startsWith("image/") ||
file.mimetype.startsWith("video/")
) {
cb(null, true);
} else {
cb(new Error("Only image and video files are allowed!"));
}
},
});

export default upload;
