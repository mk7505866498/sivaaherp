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

        let flatCosts = 0;

        let sellingPricePercent =
          0;

        let discountedPricePercent =
          0;

        const appliedCosts = [];

        // -------------------------
        // PROCESS COST CONFIGS
        // -------------------------

        costConfigs.forEach(
          (cost) => {

            // FLAT COSTS

            if (
              cost.type === "flat"
            ) {

              flatCosts +=
                cost.value;

              appliedCosts.push({
                name: cost.name,
                amount:
                  cost.value,
              });
            }

            // PERCENT COSTS

            if (
              cost.type ===
              "percent"
            ) {

              // ON SELLING PRICE

              if (
                cost.calculationOn ===
                "selling_price"
              ) {

                sellingPricePercent +=
                  cost.value;
              }

              // ON DISCOUNTED PRICE

              if (
                cost.calculationOn ===
                "discounted_price"
              ) {

                discountedPricePercent +=
                  cost.value;
              }
            }
          }
        );

        // -------------------------
        // BASE COST
        // -------------------------

        const baseCost =
          rawValue + flatCosts;

        // -------------------------
        // TARGETS
        // -------------------------

        const maxChannelDeduction =
          20;

        const targetNetMargin =
          20;

        // -------------------------
        // UNIVERSAL SELLING PRICE
        // -------------------------

        const universalSellingPrice =
          baseCost /
          (
            1 -
            (
              maxChannelDeduction +
              targetNetMargin
            ) /
              100
          );

        // -------------------------
        // CUSTOMER PAYMENT
        // -------------------------

        const customerPays =
          universalSellingPrice *
          (
            1 -
            sellingPricePercent /
              100
          );

        // -------------------------
        // SETTLEMENT
        // -------------------------

        const settlement =
          customerPays *
          (
            1 -
            discountedPricePercent /
              100
          );

        // -------------------------
        // PERCENT COSTS
        // -------------------------

        costConfigs.forEach(
          (cost) => {

            if (
              cost.type ===
              "percent"
            ) {

              let amount = 0;

              // ON SELLING PRICE

              if (
                cost.calculationOn ===
                "selling_price"
              ) {

                amount =
                  (
                    universalSellingPrice *
                    cost.value
                  ) / 100;
              }

              // ON DISCOUNTED PRICE

              if (
                cost.calculationOn ===
                "discounted_price"
              ) {

                amount =
                  (
                    customerPays *
                    cost.value
                  ) / 100;
              }

              appliedCosts.push({
                name: cost.name,
                amount,
              });
            }
          }
        );

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

          flatCosts,

          baseCost,

          universalSellingPrice,

          customerPays,

          settlement,

          appliedCosts,

          netProfit,

          netMargin,

          sellingPricePercent,

          discountedPricePercent,
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