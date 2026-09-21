import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
    }

    const messages = await Message.find({
      $or: [
        { senderId: user._id, receiverId: partnerId },
        { senderId: partnerId, receiverId: user._id },
      ],
    })
      .populate("senderId", "name role")
      .populate("receiverId", "name role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch chat history" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, appointmentId, message } = body;

    if (!receiverId || !message) {
      return NextResponse.json({ success: false, message: "Receiver ID and message are required" }, { status: 400 });
    }

    const newMessage = await Message.create({
      senderId: user._id,
      receiverId,
      appointmentId: appointmentId || null,
      message,
    });

    const populatedMsg = await Message.findById(newMessage._id)
      .populate("senderId", "name role")
      .populate("receiverId", "name role");

    return NextResponse.json({ success: true, data: populatedMsg }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 });
  }
}
