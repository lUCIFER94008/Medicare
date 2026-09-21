import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

// Safe helper to auto-create missing Doctor profiles for doctor users
async function syncMissingDoctorProfiles() {
  try {
    const doctorUsers = await User.find({ role: "doctor" });
    for (const dUser of doctorUsers) {
      const existingProfile = await Doctor.findOne({ userId: dUser._id });
      if (!existingProfile) {
        console.log(`[Doctor Migration] Creating missing profile for doctor user: ${dUser.email}`);
        await Doctor.create({
          userId: dUser._id,
          name: dUser.name,
          email: dUser.email,
          phone: dUser.phone || "",
          specialization: "General Physician",
          qualification: "MBBS",
          experience: "1+ Yrs Exp.",
          consultationFee: 50,
          about: "Dedicated healthcare professional providing compassionate patient care.",
          availability: ["Mon-Fri: 09:00 AM - 05:00 PM"],
          isVerified: false,
        });
      }
    }
  } catch (err) {
    console.error("[Doctor Sync Error]:", err);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await syncMissingDoctorProfiles();

    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization");
    const name = searchParams.get("name") || searchParams.get("search");

    const user = await getAuthUser(req);
    let query = {};

    // For patients or unauthenticated users, only show verified doctors
    if (!user || user.role !== "admin") {
      query.isVerified = true;
    }

    if (specialization && specialization !== "All") {
      query.specialization = specialization;
    }

    if (name) {
      const searchRegex = new RegExp(name.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { qualification: searchRegex },
      ];
    }

    console.log(`[Doctors API] Fetching doctors with query:`, JSON.stringify(query));

    const doctors = await Doctor.find(query)
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error("[GET Doctors Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors list" },
      { status: 500 }
    );
  }
}
