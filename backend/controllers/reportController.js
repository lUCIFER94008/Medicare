const MedicalReport = require("../models/MedicalReport");

// @desc    Upload / Save medical report
// @route   POST /api/reports
// @access  Private (Patient / Doctor)
const createReport = async (req, res) => {
  try {
    const { title, description, fileUrl, fileName, fileType, doctorId } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and file URL are required",
      });
    }

    const report = await MedicalReport.create({
      patientId: req.user.role === "patient" ? req.user._id : req.body.patientId || req.user._id,
      doctorId: doctorId || null,
      title,
      description: description || "",
      fileUrl,
      fileName: fileName || "medical_document.pdf",
      fileType: fileType || "application/pdf",
    });

    res.status(201).json({
      success: true,
      message: "Medical report uploaded successfully",
      data: report,
    });
  } catch (error) {
    console.error("[Create Report Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload medical report",
    });
  }
};

// @desc    Get reports for logged in patient
// @route   GET /api/reports/my
// @access  Private (Patient)
const getMyReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ patientId: req.user._id })
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
      message: "Failed to fetch medical reports",
    });
  }
};

// @desc    Get reports of a patient (for assigned doctor or admin)
// @route   GET /api/reports/patient/:patientId
// @access  Private (Doctor / Admin)
const getPatientReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ patientId: req.params.patientId })
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient reports",
    });
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private (Patient / Admin)
const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.patientId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this report",
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: "Medical report deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getPatientReports,
  deleteReport,
};
