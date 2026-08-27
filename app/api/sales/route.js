import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
async function generateSaleId(db) {
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: "sales" },
    {
      $inc: { sequence: 1 },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  const sequence = result?.sequence || 1;

  return `SAL26-${String(sequence).padStart(6, "0")}`;
}
export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    const db = mongoose.connection.db;
    const body = await req.json();

    const {
      saleDate,
      channel,
      customer,
      productId,
      batchId,
      quantity,
      sellingPrice,
      discount = 0,
      paymentStatus,
      paymentMethod,
      notes = "",
      silverRateOnSaleDate,
    } = body;

    /* =========================
       VALIDATION
    ========================= */

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product is required." },
        { status: 400 }
      );
    }

    if (!batchId) {
      return NextResponse.json(
        { success: false, message: "Batch is required." },
        { status: 400 }
      );
    }

    if (!channel) {
      return NextResponse.json(
        { success: false, message: "Channel is required." },
        { status: 400 }
      );
    }

    if (!quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than 0." },
        { status: 400 }
      );
    }

    if (
      sellingPrice === undefined ||
      sellingPrice === null ||
      Number(sellingPrice) < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Selling price is required." },
        { status: 400 }
      );
    }

    if (
      silverRateOnSaleDate === undefined ||
      silverRateOnSaleDate === null ||
      Number(silverRateOnSaleDate) <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Silver rate for sale date is required.",
        },
        { status: 400 }
      );
    }

    /* =========================
       START TRANSACTION
    ========================= */

    session.startTransaction();

    const product = await db.collection("products").findOne(
      {
        _id: new mongoose.Types.ObjectId(productId),
      },
      { session }
    );

    if (!product) {
      throw new Error("Product not found.");
    }

    /* =========================
       FIND SELECTED BATCH
    ========================= */

    const batchIndex = (product.batchids || []).findIndex(
      (b) => b.batchid === batchId
    );

    if (batchIndex === -1) {
      throw new Error(
        "Selected batch is not available for this product."
      );
    }

    const selectedBatch = product.batchids[batchIndex];

    const availableBatchQty = Number(
      selectedBatch.quantity || 0
    );

    const saleQty = Number(quantity);

    if (saleQty > availableBatchQty) {
      throw new Error(
        `Only ${availableBatchQty} units available in selected batch.`
      );
    }

    const currentStock = Number(product.stock || 0);

    if (saleQty > currentStock) {
      throw new Error(
        `Only ${currentStock} units available in total stock.`
      );
    }

    /* =========================
       GET BATCH COST
    ========================= */

    /*
      Batch:

      22052026250075

      Characters:
      1-8   = date
      9-11  = silver rate
      12-14 = labour
    */

    const batchSilverRate = Number(
      batchId.substring(8, 11)
    );

    const labourCost = Number(
      batchId.substring(11, 14)
    );

    if (!batchSilverRate) {
      throw new Error(
        "Could not determine silver purchase rate from batch."
      );
    }

    /* =========================
       PRODUCT WEIGHT
    ========================= */

    const weight = Number(product.grams || 0);

    if (weight <= 0) {
      throw new Error(
        "Product weight is missing."
      );
    }

    /* =========================
       REVENUE
    ========================= */

    const grossSellingValue =
      Number(sellingPrice) * saleQty;

    const totalDiscount =
      Number(discount || 0);

    const netRevenue =
      grossSellingValue - totalDiscount;

    /* =========================
       COST AT SALE DAY
    ========================= */

    const costAtThatDay =
      (
        Number(silverRateOnSaleDate) +
        labourCost
      ) *
      weight *
      saleQty;

    /* =========================
       COST OVERALL
    ========================= */

    const costOverall =
      (
        batchSilverRate +
        labourCost
      ) *
      weight *
      saleQty;

    /* =========================
       PROFITS
    ========================= */

    const profitAtThatDay =
      netRevenue - costAtThatDay;

    const profitOverall =
      netRevenue - costOverall;

    const marginAtThatDay =
      netRevenue > 0
        ? (profitAtThatDay / netRevenue) * 100
        : 0;

    const marginOverall =
      netRevenue > 0
        ? (profitOverall / netRevenue) * 100
        : 0;

    /* =========================
       UPDATE BATCH
    ========================= */

    const updatedBatches =
      [...product.batchids];

    updatedBatches[batchIndex] = {
      ...updatedBatches[batchIndex],

      quantity:
        availableBatchQty - saleQty,
    };

    /* =========================
       UPDATE PRODUCT STOCK
    ========================= */

    await db.collection("products").updateOne(
      {
        _id: product._id,
      },
      {
        $set: {
          stock: currentStock - saleQty,
          batchids: updatedBatches,
          updatedAt: new Date(),
        },
      },
      { session }
    );

    /* =========================
       SALE SNAPSHOT
    ========================= */

    const sale = {
      saleDate: saleDate
        ? new Date(saleDate)
        : new Date(),

      saleId: await generateSaleId(db),

      channel,

      customer:
        customer || "",

      productId:
        product._id,

      sku:
        product.sku_id,

      productName:
        product.name,

      category:
        product.category,

      batchId,

      quantity:
        saleQty,

      weight,

      sellingPrice:
        Number(sellingPrice),

      discount:
        totalDiscount,

      netRevenue,

      silverRateOnSaleDate:
        Number(silverRateOnSaleDate),

      silverPriceWhenBought:
        batchSilverRate,

      labourCost,

      costAtThatDay,

      costOverall,

      profitAtThatDay,

      profitOverall,

      marginAtThatDay,

      marginOverall,

      paymentStatus:
        paymentStatus || "Pending",

      paymentMethod:
        paymentMethod || "",

      notes,

      status: "completed",

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    await db.collection("sales").insertOne(
      sale,
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully.",
      sale,
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(
      "SALE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to record sale.",
      },
      {
        status: 400,
      }
    );

  } finally {

    await session.endSession();
  }
}
export async function GET() {
  try {
    await connectDB();

    const db = mongoose.connection.db;

    const sales = await db
      .collection("sales")
      .find({})
      .sort({
        saleDate: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      count: sales.length,
      data: sales.map(sale => ({
        ...sale,
        _id:
          sale._id.toString(),
        productId:
          sale.productId?.toString(),
      })),
    });

  } catch (error) {

    console.error(
      "GET SALES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch sales.",
      },
      {
        status: 500,
      }
    );
  }
}