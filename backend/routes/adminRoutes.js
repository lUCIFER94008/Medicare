const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllDoctors,
  verifyDoctor,
  rejectDoctor,
  getAllAppointments,
  getAllReports,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes protected & restricted to 'admin' role
router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/doctors", getAllDoctors);
router.put("/doctors/:id/verify", verifyDoctor);
router.put("/doctors/:id/reject", rejectDoctor);
router.get("/appointments", getAllAppointments);
router.get("/reports", getAllReports);

module.exports = router;
