import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return NextResponse.json({
      success: dbStatus === "connected",
      message: "MediCare Unified Next.js API is running",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
