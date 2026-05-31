import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function GET() {

  await connectDB();

  const db =
    mongoose.connection.db;

  const products =
    await db
      .collection("products")
      .find({})
      .toArray();

  return NextResponse.json({
    success: true,
    data: products,
  });
}