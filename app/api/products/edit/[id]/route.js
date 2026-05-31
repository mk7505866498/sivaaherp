import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

export async function PUT(
  req,
  context
) {

  try {

    await connectDB();

    const { id } =
      await context.params;

    const body =
      await req.json();

    /* REMOVE IMMUTABLE FIELDS */

    delete body._id;

    delete body.createdAt;

    delete body.updatedAt;

    delete body.__v;

    const db =
      mongoose.connection.db;

    await db
      .collection("products")
      .updateOne(

        {
          _id:
            new mongoose.Types.ObjectId(
              id
            ),
        },

        {
          $set: {

            ...body,

            updatedAt:
              new Date(),
          },
        }
      );

    return NextResponse.json({
      success: true,
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