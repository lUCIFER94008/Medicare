import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getAuthUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const otherUserId = params.id;
    const messages = await Message.find({
      $or: [
        { senderId: user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user._id },
      ],
    })
      .populate("senderId", "name role")
      .populate("receiverId", "name role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch chat messages" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const message = await Message.findByIdAndUpdate(params.id, { seen: true }, { new: true });
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update message" }, { status: 500 });
  }
}
