import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function GET() {

  try {

    await connectDB();

    const db =
      mongoose.connection.db;

    const silverRate =
      await db
        .collection("metalrates")
        .findOne({
          metal: "silver",
        });

    const currentSilverRate =
      silverRate?.ratePerGram || 0;

    const products =
      await db
        .collection("products")
        .find({})
        .toArray();

    const sourcings =
      await db
        .collection("sourcings")
        .find({})
        .toArray();

    const finalProducts =
      products.map((product) => {

        const sourcing =
          sourcings.find(
            (s) =>
              s.batchId ===
              product.batchid
          );

        const sourcedLabour =
          sourcing?.labourPerGram ||
          0;

        const rawValue =
          product.grams *
          (
            currentSilverRate +
            sourcedLabour
          );

        const packaging =
          80;

        const baseCost =
          rawValue +
          packaging;

        const worstMarketplaceDeduction =
          30;

        const targetMargin =
          20;

        const universalSellingPrice =
          baseCost /
          (
            1 -
            (
              worstMarketplaceDeduction +
              targetMargin
            ) /
              100
          );

        return {

          _id:
            product._id,

          name:
            product.name,

          universalSellingPrice:
            Math.round(
              universalSellingPrice
            ),
        };
      });

    return NextResponse.json({

      success: true,

      data:
        finalProducts,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}