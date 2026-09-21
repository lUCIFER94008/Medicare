const express = require("express");
const router = express.Router();
const {
  createReport,
  getMyReports,
  getPatientReports,
  deleteReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, createReport);
router.get("/my", protect, authorize("patient"), getMyReports);
router.get("/patient/:patientId", protect, authorize("doctor", "admin"), getPatientReports);
router.delete("/:id", protect, deleteReport);

module.exports = router;
