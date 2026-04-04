import express from "express";

import {
createLandingMedia,
getLandingMedia,
updateLandingMedia,
deleteLandingMedia,
} from "../controllers/landingMediaController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
// import upload from "../middleware/multer.js";
import { upload, checkFileSize } from "../middleware/multer.js";

const router = express.Router();

/*
========================================
ADMIN UPLOAD LANDING MEDIA
========================================
*/
router.post(
"/upload",
protect,
authorizeRoles("admin"),
upload.array("media", 3),
checkFileSize,
createLandingMedia
);

/*
========================================
GET LANDING MEDIA
========================================
*/
router.get("/", getLandingMedia);

/*
========================================
UPDATE LANDING MEDIA
========================================
*/
router.put(
"/:id",
protect,
authorizeRoles("admin"),
upload.array("media", 3),
checkFileSize,
updateLandingMedia
);

/*
========================================
DELETE LANDING MEDIA
========================================
*/
router.delete(
"/:id",
protect,
authorizeRoles("admin"),
deleteLandingMedia
);

export default router;
