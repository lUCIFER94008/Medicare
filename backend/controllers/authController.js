const User = require("../models/User");
const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = "patient",
      specialization,
      qualification,
      experience,
      consultationFee,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, email, phone, password)",
      });
    }

    // Security Rule: Public registration cannot create admin role directly
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Direct registration as Admin is forbidden.",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role === "doctor" ? "doctor" : "patient",
    });

    // If registering as a doctor, create corresponding Doctor profile
    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: specialization || "General Physician",
        qualification: qualification || "MBBS",
        experience: experience || "1+ Yrs Exp.",
        consultationFee: Number(consultationFee) || 50,
        isVerified: false, // Default false until admin verifies
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorProfile: doctorProfile ? doctorProfile._id : null,
      },
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Find user and select password explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Fetch doctor profile if role is doctor
    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorProfile,
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorProfile,
      },
    });
  } catch (error) {
    console.error("[GetMe Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
