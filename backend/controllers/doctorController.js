const Doctor = require("../models/Doctor");

// @desc    Get doctors list (Public/Patient sees verified only, Admin sees all)
// @route   GET /api/doctors
// @access  Public / Private
const getDoctors = async (req, res) => {
  try {
    const { specialization, name, search } = req.query;

    let query = {};

    // Filter by verification status unless requester is admin
    if (!req.user || req.user.role !== "admin") {
      query.isVerified = true;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (name || search) {
      const searchTerm = name || search;
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { specialization: { $regex: searchTerm, $options: "i" } },
        { qualification: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error("[Get Doctors Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors list",
    });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("[Get Doctor By ID Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details",
    });
  }
};

// @desc    Get doctors by specialization
// @route   GET /api/doctors/specialization/:specialization
// @access  Public
const getDoctorsBySpecialization = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      specialization: req.params.specialization,
      isVerified: true,
    });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

// @desc    Get logged in doctor's profile
// @route   GET /api/doctors/my-profile
// @access  Private (Doctor)
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching doctor profile",
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const {
      name,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      about,
      profileImage,
      availability,
    } = req.body;

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experience) doctor.experience = experience;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (about) doctor.about = about;
    if (profileImage) doctor.profileImage = profileImage;
    if (availability) doctor.availability = availability;

    const updatedDoctor = await doctor.save();

    res.json({
      success: true,
      message: "Doctor profile updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor profile",
    });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor)
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialization,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
};
