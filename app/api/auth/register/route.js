import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import { generateToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      role = "patient",
      specialization,
      qualification,
      experience,
      consultationFee,
    } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    if (role === "admin") {
      return NextResponse.json(
        { success: false, message: "Direct registration as Admin is forbidden." },
        { status: 403 }
      );
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role === "doctor" ? "doctor" : "patient",
    });

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: specialization || "General Physician",
        qualification: qualification || "MBBS",
        experience: experience || "1+ Yrs Exp.",
        consultationFee: Number(consultationFee) || 50,
        isVerified: false,
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          doctorProfile: doctorProfile ? doctorProfile._id : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Register Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
