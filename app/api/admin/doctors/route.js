import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const doctors = await Doctor.find().populate("userId", "name email phone").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch doctors" }, { status: 500 });
  }
}
