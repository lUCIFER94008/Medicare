import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { getAuthUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const appointment = await Appointment.findById(params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization qualification phone email");

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const appointment = await Appointment.findById(params.id);
    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    if (req.nextUrl.pathname.endsWith("/cancel")) {
      appointment.status = "cancelled";
    } else if (status) {
      appointment.status = status;
    }

    await appointment.save();

    return NextResponse.json({
      success: true,
      message: `Appointment updated to ${appointment.status}`,
      data: appointment,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update appointment" }, { status: 500 });
  }
}
