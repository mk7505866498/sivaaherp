import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function GET() {

  try {

    await connectDB();

    const db = mongoose.connection.db;

    const costs =
      await db
        .collection("costconfigs")
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

    return NextResponse.json({
      success: true,
      data: costs,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}