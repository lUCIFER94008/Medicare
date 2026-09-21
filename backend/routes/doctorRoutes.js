const express = require("express");
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialization,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getDoctors);
router.get("/my-profile", protect, authorize("doctor"), getMyDoctorProfile);
router.get("/specialization/:specialization", getDoctorsBySpecialization);
router.get("/:id", getDoctorById);
router.put("/profile", protect, authorize("doctor"), updateDoctorProfile);
router.put("/availability", protect, authorize("doctor"), updateAvailability);

module.exports = router;
