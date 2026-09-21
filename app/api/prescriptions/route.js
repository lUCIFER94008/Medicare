import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Prescription from "@/models/Prescription";
import Doctor from "@/models/Doctor";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    let prescriptions = [];
    if (user.role === "patient") {
      prescriptions = await Prescription.find({ patientId: user._id })
        .populate("doctorId", "name specialization qualification phone email")
        .populate("patientId", "name email phone")
        .sort({ createdAt: -1 });
    } else if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      if (doctorProfile) {
        prescriptions = await Prescription.find({ doctorId: doctorProfile._id })
          .populate("patientId", "name email phone")
          .populate("doctorId", "name specialization")
          .sort({ createdAt: -1 });
      }
    } else if (user.role === "admin") {
      prescriptions = await Prescription.find()
        .populate("patientId", "name email")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== "doctor") {
      return NextResponse.json({ success: false, message: "Only doctors can issue prescriptions" }, { status: 403 });
    }

    const doctorProfile = await Doctor.findOne({ userId: user._id });
    if (!doctorProfile) {
      return NextResponse.json({ success: false, message: "Doctor profile not found" }, { status: 400 });
    }

    const body = await req.json();
    const { patientId, appointmentId, medicines, instructions, notes } = body;

    if (!patientId || !medicines || medicines.length === 0) {
      return NextResponse.json({ success: false, message: "Patient ID and medicines are required" }, { status: 400 });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctorProfile._id,
      appointmentId: appointmentId || null,
      medicines,
      instructions: instructions || "Take medicines as directed",
      notes: notes || "",
    });

    return NextResponse.json({ success: true, message: "Digital prescription issued", data: prescription }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to issue prescription" }, { status: 500 });
  }
}
