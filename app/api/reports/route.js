import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MedicalReport from "@/models/MedicalReport";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    let query = {};
    if (user.role === "patient") {
      query.patientId = user._id;
    } else if (patientId) {
      query.patientId = patientId;
    }

    const reports = await MedicalReport.find(query)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch medical reports" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, fileUrl, fileName, fileType, doctorId } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ success: false, message: "Title and file URL are required" }, { status: 400 });
    }

    const report = await MedicalReport.create({
      patientId: user.role === "patient" ? user._id : body.patientId || user._id,
      doctorId: doctorId || null,
      title,
      description: description || "",
      fileUrl,
      fileName: fileName || "medical_document.pdf",
      fileType: fileType || "application/pdf",
    });

    return NextResponse.json({ success: true, message: "Medical report uploaded", data: report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to upload report" }, { status: 500 });
  }
}
