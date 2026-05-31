import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function GET(
  req,
  context
) {

  try {

    await connectDB();

    const { id } =
      await context.params;
      console.log("ID =", id);

    if (
      !id ||
      id === "undefined"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product id",
        },
        { status: 400 }
      );
    }

    const db =
      mongoose.connection.db;

    const product =
      await db
        .collection("products")
        .findOne({

          _id:
            new mongoose.Types.ObjectId(
              id
            ),
        });

    return NextResponse.json({

      success: true,

      data: product,
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