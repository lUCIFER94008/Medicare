import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Prescription from "@/models/Prescription";
import MedicalReport from "@/models/MedicalReport";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "patient") {
      return NextResponse.json(
        { success: false, message: "Access denied: Patient role required" },
        { status: 403 }
      );
    }

    const upcomingAppointmentsCount = await Appointment.countDocuments({
      patientId: user._id,
      status: { $in: ["pending", "confirmed"] },
    });

    const completedAppointmentsCount = await Appointment.countDocuments({
      patientId: user._id,
      status: "completed",
    });

    const totalAppointmentsCount = await Appointment.countDocuments({
      patientId: user._id,
    });

    const prescriptionsCount = await Prescription.countDocuments({
      patientId: user._id,
    });

    const medicalReportsCount = await MedicalReport.countDocuments({
      patientId: user._id,
    });

    const upcomingAppointments = await Appointment.find({
      patientId: user._id,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("doctorId", "name specialization qualification profileImage consultationFee")
      .sort({ appointmentDate: 1 })
      .limit(5);

    const recentPrescriptions = await Prescription.find({
      patientId: user._id,
    })
      .populate("doctorId", "name specialization qualification profileImage")
      .populate("appointmentId", "appointmentDate appointmentTime consultationType")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentReports = await MedicalReport.find({
      patientId: user._id,
    })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
        },
        statistics: {
          upcomingAppointments: upcomingAppointmentsCount,
          completedAppointments: completedAppointmentsCount,
          totalAppointments: totalAppointmentsCount,
          prescriptions: prescriptionsCount,
          medicalReports: medicalReportsCount,
        },
        upcomingAppointments,
        recentPrescriptions,
        recentReports,
      },
    });
  } catch (error) {
    console.error("[Patient Dashboard API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch patient dashboard data" },
      { status: 500 }
    );
  }
}
