import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import { comparePassword, generateToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both email and password" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorProfile,
      },
    });
  } catch (error) {
    console.error("[API Login Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
