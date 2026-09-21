import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    let appointments = [];

    if (user.role === "patient") {
      appointments = await Appointment.find({ patientId: user._id })
        .populate("doctorId", "name specialization profileImage qualification consultationFee")
        .populate("patientId", "name email phone")
        .sort({ appointmentDate: -1, createdAt: -1 });
    } else if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      if (!doctorProfile) {
        return NextResponse.json(
          { success: false, message: "Doctor profile not found" },
          { status: 400 }
        );
      }
      appointments = await Appointment.find({ doctorId: doctorProfile._id })
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .sort({ appointmentDate: -1, createdAt: -1 });
    } else if (user.role === "admin") {
      appointments = await Appointment.find()
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("[Appointments GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { doctorId, appointmentDate, appointmentTime, reason, consultationType } = body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    if (!doctor.isVerified && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Appointments can only be booked with verified doctors" },
        { status: 400 }
      );
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, message: "Doctor is already booked for this date and time slot." },
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      patientId: user._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      consultationType: consultationType || "video",
      status: "pending",
      paymentStatus: "paid",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully",
        data: appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Appointments POST Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to book appointment" },
      { status: 500 }
    );
  }
}
