const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("patient", "admin"), createAppointment);
router.get("/my", protect, getMyAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id/status", protect, authorize("doctor", "admin"), updateAppointmentStatus);
router.put("/:id/cancel", protect, cancelAppointment);

module.exports = router;
