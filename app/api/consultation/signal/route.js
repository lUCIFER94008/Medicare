import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import ConsultationSignal from "@/models/ConsultationSignal";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { appointmentId, type, payload } = body;

    if (!appointmentId || !type) {
      return NextResponse.json(
        { success: false, message: "appointmentId and signal type are required" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "doctorId",
      populate: { path: "userId" },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    const patientUserId = appointment.patientId?.toString();
    const doctorUserId =
      appointment.doctorId?.userId?._id?.toString() ||
      appointment.doctorId?.userId?.toString();
    const currentUserId = user._id.toString();

    const isPatient = patientUserId === currentUserId;
    const isDoctor = doctorUserId === currentUserId;
    const isAdmin = user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const senderRole = isDoctor ? "doctor" : isPatient ? "patient" : "admin";

    // Create signal record
    const signal = await ConsultationSignal.create({
      appointmentId: appointment._id,
      senderId: user._id,
      senderRole,
      type,
      payload: payload || null,
    });

    // Update appointment status on specific signals
    if (type === "join") {
      if (appointment.consultationStatus === "not_started") {
        appointment.consultationStatus = "waiting";
        await appointment.save();
      }
    } else if (type === "ready") {
      appointment.consultationStatus = "ongoing";
      if (!appointment.consultationStartedAt) {
        appointment.consultationStartedAt = new Date();
      }
      await appointment.save();
    } else if (type === "end-call") {
      appointment.consultationStatus = "completed";
      appointment.consultationEndedAt = new Date();
      if (isDoctor || isAdmin) {
        appointment.status = "completed";
      }
      await appointment.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        signalId: signal._id,
        type: signal.type,
        createdAt: signal.createdAt,
      },
    });
  } catch (error) {
    console.error("[Consultation Signal POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process signal" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");
    const after = searchParams.get("after"); // ISO string timestamp
    const afterId = searchParams.get("afterId"); // MongoDB ObjectId string

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "doctorId",
      populate: { path: "userId" },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    const patientUserId = appointment.patientId?.toString();
    const doctorUserId =
      appointment.doctorId?.userId?._id?.toString() ||
      appointment.doctorId?.userId?.toString();
    const currentUserId = user._id.toString();

    const isPatient = patientUserId === currentUserId;
    const isDoctor = doctorUserId === currentUserId;
    const isAdmin = user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const query = {
      appointmentId: appointment._id,
      senderId: { $ne: user._id }, // Only retrieve signals from OTHER peer
    };

    if (afterId && mongoose.isValidObjectId(afterId)) {
      query._id = { $gt: new mongoose.Types.ObjectId(afterId) };
    } else if (after) {
      query.createdAt = { $gt: new Date(after) };
    } else {
      // Recent signals from the last 15 minutes to ignore stale prior calls
      query.createdAt = { $gt: new Date(Date.now() - 15 * 60 * 1000) };
    }

    const signals = await ConsultationSignal.find(query)
      .sort({ _id: 1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: signals,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Consultation Signal GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve signals" },
      { status: 500 }
    );
  }
}
