import mongoose from "mongoose";

const landingMediaSchema = new mongoose.Schema(
{
title: String,
description: String,

media: [
{
url: String,
public_id: String,
original_name: String,
},
],

uploadedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
},
{ timestamps: true }
);

export default mongoose.model("LandingMedia", landingMediaSchema);
