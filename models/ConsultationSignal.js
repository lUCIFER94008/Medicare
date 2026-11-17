import mongoose from "mongoose";

const consultationSignalSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["doctor", "patient", "admin"],
      required: true,
    },
    type: {
      type: String,
      enum: ["join", "ready", "offer", "answer", "ice-candidate", "leave", "end-call", "ping"],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 1800, // 30 minutes TTL
    },
  },
  {
    timestamps: true,
  }
);

consultationSignalSchema.index({ appointmentId: 1, createdAt: 1 });

export default mongoose.models.ConsultationSignal || mongoose.model("ConsultationSignal", consultationSignalSchema);
