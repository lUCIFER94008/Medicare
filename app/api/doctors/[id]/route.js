import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const doctor = await Doctor.findById(params.id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctor details" },
      { status: 500 }
    );
  }
}
