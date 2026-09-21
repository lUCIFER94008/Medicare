import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization");
    const name = searchParams.get("name") || searchParams.get("search");

    const user = await getAuthUser(req);
    let query = {};

    if (!user || user.role !== "admin") {
      query.isVerified = true;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (name) {
      query.$or = [
        { name: { $regex: name, $options: "i" } },
        { specialization: { $regex: name, $options: "i" } },
        { qualification: { $regex: name, $options: "i" } },
      ];
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors list" },
      { status: 500 }
    );
  }
}
