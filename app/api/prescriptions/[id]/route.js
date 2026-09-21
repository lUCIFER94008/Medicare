import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Prescription from "@/models/Prescription";
import { getAuthUser } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const prescription = await Prescription.findById(params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization qualification email phone");

    if (!prescription) {
      return NextResponse.json({ success: false, message: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: prescription });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch prescription details" }, { status: 500 });
  }
}
