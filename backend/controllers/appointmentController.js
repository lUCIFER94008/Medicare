const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, consultationType } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (doctorId, date, time, reason)",
      });
    }

    // Verify doctor exists and is verified
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.isVerified && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Appointments can only be booked with verified doctors",
      });
    }

    // Check for duplicate pending/confirmed booking at same date & time for same doctor
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Doctor is already booked for this date and time slot. Please choose another slot.",
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      consultationType: consultationType || "video",
      status: "pending",
      paymentStatus: "paid", // Simulated default payment for demo
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("[Create Appointment Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to book appointment",
    });
  }
};

// @desc    Get appointments for logged in user (Patient or Doctor)
// @route   GET /api/appointments/my
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === "patient") {
      appointments = await Appointment.find({ patientId: req.user._id })
        .populate("doctorId", "name specialization profileImage qualification consultationFee")
        .populate("patientId", "name email phone")
        .sort({ appointmentDate: -1, createdAt: -1 });
    } else if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(400).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      appointments = await Appointment.find({ doctorId: doctorProfile._id })
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .sort({ appointmentDate: -1, createdAt: -1 });
    } else if (req.user.role === "admin") {
      appointments = await Appointment.find()
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("[Get Appointments Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization qualification phone email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment details",
    });
  }
};

// @desc    Update appointment status (Doctor/Admin)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor / Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
    });
  }
};

// @desc    Cancel appointment (Patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.patientId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this appointment",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
