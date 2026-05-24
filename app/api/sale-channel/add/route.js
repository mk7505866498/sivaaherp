import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function POST(req) {

  try {

    await connectDB();

    const body = await req.json();

    const db = mongoose.connection.db;

    await db
      .collection("salechannels")
      .insertOne({

        name: body.name,

        key: body.key,

        selectedCosts:
          body.selectedCosts || [],

        isActive: true,

        createdAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message:
        "Channel Added",
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