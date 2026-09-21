import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const doctor = await Doctor.findById(params.id);
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor profile not found" }, { status: 404 });
    }

    doctor.isVerified = true;
    await doctor.save();

    return NextResponse.json({ success: true, message: `Doctor ${doctor.name} verified successfully`, data: doctor });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to verify doctor" }, { status: 500 });
  }
}
