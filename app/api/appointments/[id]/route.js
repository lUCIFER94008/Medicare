import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import { getAuthUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const appointment = await Appointment.findById(params.id)
      .populate("patientId", "name email phone role")
      .populate({
        path: "doctorId",
        select: "userId name specialization qualification experience consultationFee profileImage availability about phone email",
      });

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    // Authorization check
    const isPatient = appointment.patientId && appointment.patientId._id.toString() === user._id.toString();
    const isDoctor = appointment.doctorId && appointment.doctorId.userId && appointment.doctorId.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied: You are not a participant in this appointment" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("[GET Appointment Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const appointment = await Appointment.findById(params.id).populate("doctorId");
    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    const isPatient = appointment.patientId.toString() === user._id.toString();
    const isDoctor = appointment.doctorId && appointment.doctorId.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    if (status) {
      appointment.status = status;
    }

    await appointment.save();

    return NextResponse.json({
      success: true,
      message: `Appointment status updated to ${appointment.status}`,
      data: appointment,
    });
  } catch (error) {
    console.error("[PUT Appointment Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to update appointment" }, { status: 500 });
  }
}
