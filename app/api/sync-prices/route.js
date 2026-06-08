import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function POST() {

  try {

    await connectDB();

    const db =
      mongoose.connection.db;

    // ----------------------------------
    // FETCH LIVE COST PRICE DATA
    // ----------------------------------

    const pricingRes =
      await fetch(
        `https://sivaaherp.vercel.app/api/cost-price/sivaah`,
        {
          cache: "no-store",
        }
      );

    const pricingData =
      await pricingRes.json();

    if (!pricingData.success) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to fetch pricing data",
        },
        { status: 500 }
      );
    }

    const pricingProducts =
      pricingData.data;

    let updatedCount = 0;

    // ----------------------------------
    // LOOP PRODUCTS
    // ----------------------------------

    for (const pricingProduct of pricingProducts) {

      const universalSellingPrice =
        pricingProduct.universalSellingPrice;

      // ----------------------------------
      // RANDOM MRP
      // ----------------------------------

      // const mrpMultiplier =
      //   1.20 +
      //   Math.random() * 0.10;

      // const mrp =
      //   Math.round(
      //     universalSellingPrice *
      //     mrpMultiplier
      //   );

      // ----------------------------------
      // UPDATE PRODUCT
      // ----------------------------------

      await db
        .collection("products")
        .updateOne(
          {
            _id:
              new mongoose.Types.ObjectId(
                pricingProduct._id
              ),
          },
          {
            $set: {

              price:
                Math.round(
                  universalSellingPrice
                ),

              updatedAt:
                new Date(),
            },
          }
        );

      console.log(
        "UPDATED:",
        pricingProduct.name,
        Math.round(
          universalSellingPrice
        )
      );

      updatedCount++;
    }

    return NextResponse.json({

      success: true,

      updatedCount,
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