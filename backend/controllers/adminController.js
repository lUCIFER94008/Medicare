const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const MedicalReport = require("../models/MedicalReport");

// @desc    Get admin dashboard metrics & system stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await Doctor.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });
    const totalReports = await MedicalReport.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        verifiedDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalReports,
      },
    });
  } catch (error) {
    console.error("[Admin Dashboard Stats Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// @desc    Get all doctors list (including pending verification)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "name email phone").sort({ createdAt: -1 });
    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors list",
    });
  }
};

// @desc    Verify a doctor profile
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin)
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    doctor.isVerified = true;
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.name} verified successfully`,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify doctor",
    });
  }
};

// @desc    Reject / Unverify a doctor
// @route   PUT /api/admin/doctors/:id/reject
// @access  Private (Admin)
const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    doctor.isVerified = false;
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.name} verification status revoked`,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor verification",
    });
  }
};

// @desc    Get all appointments system-wide
// @route   GET /api/admin/appointments
// @access  Private (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch system appointments",
    });
  }
};

// @desc    Get all medical reports system-wide
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAllReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch system medical reports",
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDoctors,
  verifyDoctor,
  rejectDoctor,
  getAllAppointments,
  getAllReports,
};
