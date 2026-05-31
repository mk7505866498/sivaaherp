import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function GET() {

  try {

    await connectDB();

    const db =
      mongoose.connection.db;

    const categories =
      await db
        .collection("categories")
        .find({})
        .toArray();

    return NextResponse.json({

      success: true,

      data: categories,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}