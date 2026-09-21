import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

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
    const partnerId = searchParams.get("partnerId");

    let messages = [];

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate("doctorId");
      if (!appointment) {
        return NextResponse.json(
          { success: false, message: "Appointment not found" },
          { status: 404 }
        );
      }

      const isPatient = appointment.patientId.toString() === user._id.toString();
      const isDoctor =
        appointment.doctorId &&
        appointment.doctorId.userId &&
        appointment.doctorId.userId.toString() === user._id.toString();
      const isAdmin = user.role === "admin";

      if (!isPatient && !isDoctor && !isAdmin) {
        return NextResponse.json(
          { success: false, message: "Access denied: You are not a participant in this conversation" },
          { status: 403 }
        );
      }

      // Mark incoming messages as seen
      await Message.updateMany(
        { appointmentId, receiverId: user._id, seen: false },
        { $set: { seen: true } }
      );

      messages = await Message.find({ appointmentId })
        .populate("senderId", "name role email")
        .populate("receiverId", "name role email")
        .sort({ createdAt: 1 });
    } else if (partnerId) {
      messages = await Message.find({
        $or: [
          { senderId: user._id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user._id },
        ],
      })
        .populate("senderId", "name role email")
        .populate("receiverId", "name role email")
        .sort({ createdAt: 1 });
    } else {
      messages = await Message.find({
        $or: [{ senderId: user._id }, { receiverId: user._id }],
      })
        .populate("senderId", "name role email")
        .populate("receiverId", "name role email")
        .populate("appointmentId", "appointmentDate appointmentTime reason status")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("[GET Messages Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chat history" },
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
    let { receiverId, appointmentId, message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Message text cannot be empty" },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Message exceeds maximum length of 2000 characters" },
        { status: 400 }
      );
    }

    if (!appointmentId && !receiverId) {
      return NextResponse.json(
        { success: false, message: "Appointment ID or Receiver ID is required" },
        { status: 400 }
      );
    }

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate("doctorId");
      if (!appointment) {
        return NextResponse.json(
          { success: false, message: "Appointment not found" },
          { status: 404 }
        );
      }

      const isPatient = appointment.patientId.toString() === user._id.toString();
      const isDoctor =
        appointment.doctorId &&
        appointment.doctorId.userId &&
        appointment.doctorId.userId.toString() === user._id.toString();
      const isAdmin = user.role === "admin";

      if (!isPatient && !isDoctor && !isAdmin) {
        return NextResponse.json(
          { success: false, message: "Access denied: Cannot send message to an unauthorized appointment" },
          { status: 403 }
        );
      }

      if (!receiverId) {
        if (isPatient) {
          receiverId = appointment.doctorId.userId;
        } else if (isDoctor) {
          receiverId = appointment.patientId;
        } else {
          receiverId = appointment.patientId;
        }
      }
    }

    const newMessage = await Message.create({
      senderId: user._id,
      receiverId,
      appointmentId: appointmentId || null,
      message: trimmedMessage,
      seen: false,
    });

    const populatedMsg = await Message.findById(newMessage._id)
      .populate("senderId", "name role email")
      .populate("receiverId", "name role email");

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        data: populatedMsg,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST Message Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}
