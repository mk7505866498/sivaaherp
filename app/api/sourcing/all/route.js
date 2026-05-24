import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Sourcing from "@/models/Sourcing";

export async function GET() {
  try {
    await connectDB();

    const sourcings = await Sourcing.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: sourcings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}