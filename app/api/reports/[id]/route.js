import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MedicalReport from "@/models/MedicalReport";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const report = await MedicalReport.findById(params.id);
    if (!report) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
    }

    if (report.patientId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Not authorized to delete report" }, { status: 403 });
    }

    await report.deleteOne();

    return NextResponse.json({ success: true, message: "Medical report deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete report" }, { status: 500 });
  }
}
