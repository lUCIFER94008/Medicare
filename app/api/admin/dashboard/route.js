import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import MedicalReport from "@/models/MedicalReport";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await Doctor.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });
    const totalReports = await MedicalReport.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        verifiedDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalReports,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch admin stats" }, { status: 500 });
  }
}
