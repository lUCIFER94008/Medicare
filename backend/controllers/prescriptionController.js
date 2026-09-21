const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");

// @desc    Create digital prescription (Doctor only)
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, instructions, notes } = req.body;

    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and at least one medicine entry are required",
      });
    }

    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctorProfile._id,
      appointmentId: appointmentId || null,
      medicines,
      instructions: instructions || "Take medicines as directed",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Digital prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    console.error("[Create Prescription Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
    });
  }
};

// @desc    Get prescriptions for logged in user (Patient or Doctor)
// @route   GET /api/prescriptions/my
// @access  Private
const getMyPrescriptions = async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === "patient") {
      prescriptions = await Prescription.find({ patientId: req.user._id })
        .populate("doctorId", "name specialization qualification phone email")
        .populate("patientId", "name email phone")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(400).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      prescriptions = await Prescription.find({ doctorId: doctorProfile._id })
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "admin") {
      prescriptions = await Prescription.find()
        .populate("patientId", "name email")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization qualification email phone");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription details",
    });
  }
};

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
};
