import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function GET(
  req,
  context
) {

  try {

    await connectDB();

    const { batchid } =
      await context.params;

    const db =
      mongoose.connection.db;

    const products =
      await db
        .collection("products")
        .find({
          batchid: batchid,
        })
        .toArray();

    return NextResponse.json({
      success: true,
      data: products,
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