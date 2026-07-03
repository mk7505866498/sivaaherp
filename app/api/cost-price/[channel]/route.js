import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import mongoose from "mongoose";

export async function GET(
  req,
  context
) {
  try {

    await connectDB();

    const { channel } =
      await context.params;

    const db =
      mongoose.connection.db;

    // -----------------------------
    // GET CHANNEL
    // -----------------------------

    const saleChannel =
      await db
        .collection("salechannels")
        .findOne({
          key: channel,
        });

    if (!saleChannel) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Channel not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // GET CHANNEL COST CONFIGS
    // -----------------------------

    const costConfigs =
      await db
        .collection(
          "costconfigs"
        )
        .find({
          key: {
            $in:
              saleChannel.selectedCosts,
          },
        })
        .toArray();

    // -----------------------------
    // GET SILVER RATE
    // -----------------------------

    const silverRate =
      await db
        .collection(
          "metalrates"
        )
        .findOne({
          metal: "silver",
        });

    const currentSilverRate =
      silverRate?.ratePerGram || 0;

    // -----------------------------
    // GET PRODUCTS
    // -----------------------------

    const products =
      await db
        .collection("products")
        .find({})
        .toArray();

    // -----------------------------
    // GET SOURCINGS
    // -----------------------------

    const sourcings =
      await db
        .collection(
          "sourcings"
        )
        .find({})
        .toArray();

    // -----------------------------
    // FINAL PRODUCTS
    // -----------------------------

    const finalProducts =
      products.map((product) => {

        // -------------------------
        // FIND SOURCING
        // -------------------------

        const sourcing =
          sourcings.find(
            (s) =>
              s.batchId ===
              product.batchid
          );

        const sourcedLabour =
          sourcing?.labourPerGram ||
          0;

        // -------------------------
        // RAW VALUE
        // -------------------------

        const rawValue =
          product.grams *
          (
            currentSilverRate +
            sourcedLabour
          );

        // -------------------------
        // COST VARIABLES
        // -------------------------

   const packagingCost = 80;

let marketplaceFlatDeduction = 0;


const appliedCosts = [];

      

        // -------------------------
        // PROCESS COST CONFIGS
        // -------------------------

       costConfigs.forEach((cost) => {

  if (cost.type === "flat") {

    appliedCosts.push({
      name: cost.name,
      amount: cost.value,
    });

    // Packaging is manufacturing cost

    if (cost.key === "packagingonline") {

      return;
    }

    // Every other flat cost is marketplace deduction

    marketplaceFlatDeduction +=
      cost.value;
  }

 

});

        // -------------------------
        // BASE COST
        // -------------------------

        const baseCost =
  rawValue + packagingCost;
  

        // -------------------------
        // TARGETS
        // -------------------------

        // const maxChannelDeduction =
        //   20;

        // const targetNetMargin =
        //   20;

        // -------------------------
        // UNIVERSAL SELLING PRICE
        // -------------------------

        // const universalSellingPrice =
        //   baseCost /
        //   (
        //     1 -
        //     (
        //       maxChannelDeduction +
        //       targetNetMargin
        //     ) /
        //       100
        //   );
const universalSellingPrice =
  product.price;
        // -------------------------
        // CUSTOMER PAYMENT
        // -------------------------
let customerPays =
  universalSellingPrice;
if (channel === "website") {

  const coupon =
    costConfigs.find(
      c => c.key === "discount20"
    );

  if (coupon) {

    customerPays =
      universalSellingPrice *
      (1 - coupon.value / 100);

  }

}
        // -------------------------
        // SETTLEMENT
        // -------------------------

     let totalPercentDeduction = 0;

costConfigs.forEach(cost => {

  if (cost.type !== "percent")
    return;

  let amount = 0;

  if (
    cost.calculationOn ===
    "selling_price"
  ) {

    amount =
      universalSellingPrice *
      cost.value /
      100;

  }

  if (
    cost.calculationOn ===
    "discounted_price"
  ) {

    amount =
      customerPays *
      cost.value /
      100;

  }

  totalPercentDeduction +=
    amount;

  appliedCosts.push({
    name: cost.name,
    amount,
  });

});

const settlement =
  customerPays
  - marketplaceFlatDeduction
  - totalPercentDeduction;
        // -------------------------
        // PERCENT COSTS
        // -------------------------


        // -------------------------
        // NET PROFIT
        // -------------------------

        const netProfit =
          settlement -
          baseCost;

        // -------------------------
        // NET MARGIN
        // -------------------------

        const netMargin =
          (
            (netProfit /
              universalSellingPrice) *
            100
          ).toFixed(2);

        return {

          ...product,

          currentSilverRate,

          sourcedLabour,

          rawValue,


          baseCost,

          universalSellingPrice,

          customerPays,

          settlement,

          appliedCosts,

          netProfit,

          netMargin,
        };
      });

    return NextResponse.json({
      success: true,
      data: finalProducts,
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