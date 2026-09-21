import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authorized, token validation failed" },
        { status: 401 }
      );
    }

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    return NextResponse.json({
      success: true,
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
    return NextResponse.json(
      { success: false, message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
