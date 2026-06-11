import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

// -------------------------------------
// GET CURRENT SILVER RATE
// -------------------------------------

export async function GET() {

  try {

    await connectDB();

    const db =
      mongoose.connection.db;

    const silver =
      await db
        .collection("metalrates")
        .findOne({
          metal: "silver",
        });

    return NextResponse.json({

      success: true,

      ratePerGram:
        silver?.ratePerGram || 0,

      updatedAt:
        silver?.updatedAt || null,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch silver rate",
      },
      {
        status: 500,
      }
    );
  }
}

// -------------------------------------
// UPDATE SILVER RATE
// -------------------------------------

export async function POST(req) {

  try {

    await connectDB();

    const db =
      mongoose.connection.db;

    const body =
      await req.json();

    const ratePerGram =
      Number(
        body.ratePerGram
      );

    if (
      !ratePerGram ||
      ratePerGram <= 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid silver rate",
        },
        {
          status: 400,
        }
      );
    }

    await db
      .collection("metalrates")
      .updateOne(
        {
          metal: "silver",
        },
        {
          $set: {

            ratePerGram,

            updatedAt:
              new Date(),
          },
        },
        {
          upsert: true,
        }
      );

    // -------------------------------------
    // AUTO SYNC PRICES
    // -------------------------------------

    try {

      await fetch(

        "https://sivaaherp.vercel.app/api/sync-prices",

        {
          method: "POST",
        }
      );

    } catch (syncError) {

      console.log(
        "Price Sync Failed:",
        syncError
      );
    }

    return NextResponse.json({

      success: true,

      message:
        "Silver rate updated successfully",

      ratePerGram,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update silver rate",
      },
      {
        status: 500,
      }
    );
  }
}