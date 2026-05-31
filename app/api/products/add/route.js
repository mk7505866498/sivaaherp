import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function POST(req) {

  try {

    await connectDB();

    const body =
      await req.json();

    const db =
      mongoose.connection.db;

    const result =
      await db
        .collection("products")
        .insertOne({

          ...body,

          material:
            "925 Silver",

          isActive: true,

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        });

    // AUTO RUN PRICING ENGINE

    await fetch(
      "http://localhost:3000/api/sync-prices",
      {
        method: "POST",
      }
    );

    return NextResponse.json({
      success: true,
      insertedId:
        result.insertedId,
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