import express from "express";
import {
  createAvailability,
  getAllAvailability,
  updateAvailability,
  deleteAvailability,
} from "../controllers/adminAvailabilityController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/", createAvailability);
router.get("/", getAllAvailability);
router.put("/:availabilityId", updateAvailability);
router.delete("/:availabilityId", deleteAvailability);

export default router;