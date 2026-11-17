import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email phone role")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone role" },
      });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Role check: Is logged in user the patient, doctor, or admin?
    const patientUserId = appointment.patientId?._id?.toString();
    const doctorUserId =
      appointment.doctorId?.userId?._id?.toString() ||
      appointment.doctorId?.userId?.toString();
    const currentUserId = user._id.toString();

    const isPatient = patientUserId === currentUserId;
    const isDoctor = doctorUserId === currentUserId;
    const isAdmin = user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied: You are not authorized to join this consultation room" },
        { status: 403 }
      );
    }

    // Check status
    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "This appointment has been cancelled and is not eligible for video consultation." },
        { status: 400 }
      );
    }

    // Set or get consultationRoomId
    const roomId = appointment.consultationRoomId || `consultation_room_${appointment._id}`;
    if (!appointment.consultationRoomId) {
      appointment.consultationRoomId = roomId;
      if (appointment.consultationStatus === "not_started") {
        appointment.consultationStatus = "waiting";
      }
      await appointment.save();
    }

    // ICE servers (STUN + optional TURN)
    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ];

    if (process.env.TURN_SERVER_URL) {
      iceServers.push({
        urls: process.env.TURN_SERVER_URL,
        username: process.env.TURN_USERNAME || "",
        credential: process.env.TURN_CREDENTIAL || "",
      });
    }

    const roleInCall = isDoctor ? "doctor" : isPatient ? "patient" : "admin";

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        appointmentId: appointment._id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reason: appointment.reason,
        status: appointment.status,
        consultationStatus: appointment.consultationStatus || "waiting",
        consultationStartedAt: appointment.consultationStartedAt,
        consultationEndedAt: appointment.consultationEndedAt,
        roleInCall,
        doctor: {
          id: appointment.doctorId?._id,
          name: appointment.doctorId?.name,
          specialization: appointment.doctorId?.specialization,
          qualification: appointment.doctorId?.qualification,
          consultationFee: appointment.doctorId?.consultationFee,
        },
        patient: {
          id: appointment.patientId?._id,
          name: appointment.patientId?.name,
          email: appointment.patientId?.email,
          phone: appointment.patientId?.phone,
        },
        iceServers,
      },
    });
  } catch (error) {
    console.error("[Consultation Room GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize consultation room" },
      { status: 500 }
    );
  }
}

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
    const { appointmentId, action } = body;

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

    if (action === "start") {
      appointment.consultationStatus = "ongoing";
      if (!appointment.consultationStartedAt) {
        appointment.consultationStartedAt = new Date();
      }
      await appointment.save();
    } else if (action === "end") {
      appointment.consultationStatus = "completed";
      appointment.consultationEndedAt = new Date();
      // If doctor ends consultation, also mark appointment completed
      if (isDoctor || isAdmin) {
        appointment.status = "completed";
      }
      await appointment.save();
    }

    return NextResponse.json({
      success: true,
      message: `Consultation status updated to ${appointment.consultationStatus}`,
      consultationStatus: appointment.consultationStatus,
    });
  } catch (error) {
    console.error("[Consultation Room POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update consultation room status" },
      { status: 500 }
    );
  }
}
