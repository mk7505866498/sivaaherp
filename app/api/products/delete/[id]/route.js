import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function DELETE(
  req,
  { params }
) {

  await connectDB();

  const db =
    mongoose.connection.db;

  await db
    .collection("products")
    .deleteOne({
      _id:
        new mongoose.Types.ObjectId(
          params.id
        ),
    });

  return NextResponse.json({
    success: true,
  });
}