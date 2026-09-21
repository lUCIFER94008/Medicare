import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    title: {
      type: String,
      required: [true, "Report title is required"],
    },
    description: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileName: {
      type: String,
      default: "medical_report.pdf",
    },
    fileType: {
      type: String,
      default: "application/pdf",
    },
  },
  {
    timestamps: true,
  }
);

medicalReportSchema.index({ patientId: 1 });
medicalReportSchema.index({ doctorId: 1 });
medicalReportSchema.index({ createdAt: -1 });

export default mongoose.models.MedicalReport || mongoose.model("MedicalReport", medicalReportSchema);
