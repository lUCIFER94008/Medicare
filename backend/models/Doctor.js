const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Doctor name is required"],
    },
    email: {
      type: String,
      required: [true, "Doctor email is required"],
    },
    phone: {
      type: String,
      required: [true, "Doctor phone is required"],
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      enum: [
        "General Physician",
        "Cardiologist",
        "Dermatologist",
        "Pediatrician",
        "Neurologist",
        "Orthopedic",
        "Gynecologist",
        "Psychiatrist",
        "Other",
      ],
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
    },
    about: {
      type: String,
      default: "Dedicated healthcare professional providing compassionate patient care.",
    },
    profileImage: {
      type: String,
      default: "",
    },
    availability: {
      type: [String],
      default: ["Mon-Fri: 09:00 AM - 05:00 PM"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isVerified: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
