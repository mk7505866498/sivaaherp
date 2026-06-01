import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function GET(
  req,
  context
) {

  try {

    await connectDB();

    const { slug } =
      await context.params;

    const db =
      mongoose.connection.db;

    const certificate =
      await db
        .collection(
          "certificates"
        )
        .findOne({
          slug,
        });

    if (!certificate) {

      return NextResponse.json(

        {
          success: false,
        },

        { status: 404 }
      );
    }

    return NextResponse.json({

      success: true,

      data:
        certificate,
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