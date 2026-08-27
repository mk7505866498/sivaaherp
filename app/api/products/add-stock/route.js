import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const db = mongoose.connection.db;

    const body = await req.json();

    const {
      productId,
      quantity,
      batchid,
    } = body;

    /* =========================
       VALIDATION
    ========================= */

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    if (!quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than 0.",
        },
        { status: 400 }
      );
    }

    if (!batchid) {
      return NextResponse.json(
        {
          success: false,
          message: "Batch ID is required.",
        },
        { status: 400 }
      );
    }

    /* =========================
       VALIDATE BATCH ID
       
       Format:
       DDMMYYYY + SILVER RATE + LABOUR

       Example:
       22052026250075

       22052026 = Date
       250      = Silver rate
       075      = Labour
    ========================= */

    const batchString = String(batchid);

    if (!/^\d{14}$/.test(batchString)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid batch ID format. Expected 14 digit batch ID.",
        },
        { status: 400 }
      );
    }

    /* =========================
       EXTRACT BATCH INFORMATION
    ========================= */

    const silverRate = Number(
      batchString.substring(8, 11)
    );

    const labourCost = Number(
      batchString.substring(11, 14)
    );

    if (silverRate <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid silver purchase rate in batch ID.",
        },
        { status: 400 }
      );
    }

    if (labourCost < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid labour cost in batch ID.",
        },
        { status: 400 }
      );
    }

    /* =========================
       FIND PRODUCT
    ========================= */

    const product = await db
      .collection("products")
      .findOne({
        _id: new mongoose.Types.ObjectId(productId),
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* =========================
       BATCH ARRAY
    ========================= */

    const currentBatches =
      Array.isArray(product.batchids)
        ? product.batchids
        : [];

    const existingBatchIndex =
      currentBatches.findIndex(
        (batch) =>
          String(batch.batchid) === batchString
      );

    let updatedBatches;

    /* =========================
       EXISTING BATCH
    ========================= */

    if (existingBatchIndex !== -1) {
      updatedBatches = [...currentBatches];

      updatedBatches[existingBatchIndex] = {
        ...updatedBatches[existingBatchIndex],

        quantity:
          Number(
            updatedBatches[
              existingBatchIndex
            ].quantity || 0
          ) + Number(quantity),
      };
    }

    /* =========================
       NEW BATCH
    ========================= */

    else {
      updatedBatches = [
        ...currentBatches,

        {
          batchid: batchString,

          quantity: Number(quantity),
        },
      ];
    }

    /* =========================
       UPDATE TOTAL STOCK
    ========================= */

    const currentStock =
      Number(product.stock || 0);

    const newStock =
      currentStock + Number(quantity);

    /* =========================
       UPDATE PRODUCT
    ========================= */

    await db
      .collection("products")
      .updateOne(
        {
          _id:
            new mongoose.Types.ObjectId(
              productId
            ),
        },
        {
          $set: {
            batchids: updatedBatches,

            stock: newStock,

            updatedAt: new Date(),
          },
        }
      );

    /* =========================
       SUCCESS
    ========================= */

    return NextResponse.json({
      success: true,

      message:
        existingBatchIndex !== -1
          ? "Stock added to existing batch."
          : "New batch added successfully.",

      productId,

      batchid: batchString,

      silverRate,

      labourCost,

      quantityAdded:
        Number(quantity),

      totalStock:
        newStock,

      batchids:
        updatedBatches,
    });

  } catch (error) {

    console.error(
      "ADD STOCK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to add stock.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}