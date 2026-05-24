import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function GET() {

  try {

    await connectDB();

    const db = mongoose.connection.db;

    const channels =
      await db
        .collection("salechannels")
        .find({})
        .toArray();

    return NextResponse.json({
      success: true,
      data: channels,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Server Error",
      },
      { status: 500 }
    );
  }
}