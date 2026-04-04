import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import LandingMedia from "../models/landingMediaModel.js";

// =======================================
// CREATE LANDING MEDIA
// =======================================
export const createLandingMedia = async (req, res) => {
try {
const { title, description } = req.body;

if (!title || !description) {
return res.status(400).json({
message: "Title and description are required",
});
}

if (!req.files || req.files.length === 0) {
return res.status(400).json({
message: "No files uploaded",
});
}

const uploadedFiles = [];

for (const file of req.files) {
const result = await new Promise((resolve, reject) => {
const stream = cloudinary.uploader.upload_stream(
{ folder: "xdrive-landing" },
(error, result) => {
if (error) reject(error);
else resolve(result);
}
);

streamifier.createReadStream(file.buffer).pipe(stream);
});

uploadedFiles.push({
url: result.secure_url,
public_id: result.public_id,
original_name: file.originalname,
});
}

// 🔥 Save to MongoDB
const landingMedia = await LandingMedia.create({
title,
description,
media: uploadedFiles,
uploadedBy: req.user?._id,
});

res.status(201).json({
message: "Landing media uploaded successfully",
data: landingMedia,
});
} catch (error) {
console.error(error);

res.status(500).json({
message: "Upload failed",
error: error.message,
});
}
};

// =======================================
// GET LANDING MEDIA
// =======================================
export const getLandingMedia = async (req, res) => {
try {
const media = await LandingMedia.find().sort({ createdAt: -1 });

res.status(200).json({
count: media.length,
data: media,
});
} catch (error) {
res.status(500).json({
message: "Failed to fetch media",
error: error.message,
});
}
};

// =======================================
// FLEXIBLE UPDATE LANDING MEDIA
// Can update title OR description OR images OR all at once
// =======================================
export const updateLandingMedia = async (req, res) => {
try {
const { id } = req.params;

const landingMedia = await LandingMedia.findById(id);
if (!landingMedia) {
return res.status(404).json({ message: "Landing media not found" });
}

// ----------------------------
// Update title if provided
// ----------------------------
if (req.body.title) {
landingMedia.title = req.body.title;
}

// ----------------------------
// Update description if provided
// ----------------------------
if (req.body.description) {
landingMedia.description = req.body.description;
}

// ----------------------------
// Replace images if new files uploaded
// ----------------------------
if (req.files && req.files.length > 0) {
// Delete old images from Cloudinary
if (landingMedia.media && landingMedia.media.length > 0) {
for (const media of landingMedia.media) {
await cloudinary.uploader.destroy(media.public_id);
}
}

// Upload new images
const uploadedFiles = [];
for (const file of req.files) {
const result = await new Promise((resolve, reject) => {
const stream = cloudinary.uploader.upload_stream(
{ folder: "xdrive-landing" },
(error, result) => {
if (error) reject(error);
else resolve(result);
}
);
streamifier.createReadStream(file.buffer).pipe(stream);
});

uploadedFiles.push({
url: result.secure_url,
public_id: result.public_id,
original_name: file.originalname,
});
}

// Replace media array with new uploads
landingMedia.media = uploadedFiles;
}

// ----------------------------
// Save changes
// ----------------------------
const updated = await landingMedia.save();

res.status(200).json({
message: "Landing media updated successfully",
data: updated,
});
} catch (error) {
console.error(error);
res.status(500).json({ message: "Update failed", error: error.message });
}
};


// =======================================
// DELETE LANDING MEDIA
// =======================================
export const deleteLandingMedia = async (req, res) => {
try {
const { id } = req.params;

const landingMedia = await LandingMedia.findById(id);

if (!landingMedia) {
return res.status(404).json({
message: "Landing media not found",
});
}

// delete images from cloudinary
for (const media of landingMedia.media) {
await cloudinary.uploader.destroy(media.public_id);
}

await LandingMedia.findByIdAndDelete(id);

res.status(200).json({
message: "Landing media deleted successfully",
});

} catch (error) {
res.status(500).json({
message: "Delete failed",
error: error.message,
});
}
};
