import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function DELETE(req, { params }) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    const db = mongoose.connection.db;

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sale ID.",
        },
        { status: 400 }
      );
    }

    session.startTransaction();

    /* =========================
       FIND SALE
    ========================= */

    const sale = await db.collection("sales").findOne(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      { session }
    );

    if (!sale) {
      throw new Error("Sale not found.");
    }

    /* =========================
       DON'T DELETE TWICE
    ========================= */

    if (sale.status === "cancelled") {
      throw new Error("This sale is already cancelled.");
    }

    /* =========================
       FIND PRODUCT
    ========================= */

    const product = await db.collection("products").findOne(
      {
        _id: sale.productId,
      },
      { session }
    );

    if (!product) {
      throw new Error(
        "Product associated with this sale was not found."
      );
    }

    /* =========================
       FIND BATCH
    ========================= */

    const batchId = sale.batchId;

    if (!batchId) {
      throw new Error(
        "Batch ID is missing from this sale."
      );
    }

    const batchIndex = (
      Array.isArray(product.batchids)
        ? product.batchids
        : []
    ).findIndex(
      (batch) =>
        batch.batchid === batchId
    );

    if (batchIndex === -1) {
      throw new Error(
        "Original batch was not found in this product."
      );
    }

    /* =========================
       RESTORE QUANTITY
    ========================= */

    const saleQuantity =
      Number(sale.quantity || 0);

    if (saleQuantity <= 0) {
      throw new Error(
        "Invalid sale quantity."
      );
    }

    const updatedBatches = [
      ...product.batchids,
    ];

    const currentBatchQuantity =
      Number(
        updatedBatches[batchIndex].quantity || 0
      );

    updatedBatches[batchIndex] = {
      ...updatedBatches[batchIndex],

      quantity:
        currentBatchQuantity +
        saleQuantity,
    };

    /* =========================
       RESTORE TOTAL STOCK
    ========================= */

    const currentStock =
      Number(product.stock || 0);

    const newStock =
      currentStock + saleQuantity;

    /* =========================
       UPDATE PRODUCT
    ========================= */

    await db.collection("products").updateOne(
      {
        _id: product._id,
      },
      {
        $set: {
          stock: newStock,

          batchids:
            updatedBatches,

          updatedAt:
            new Date(),
        },
      },
      { session }
    );

    /* =========================
       DELETE SALE
    ========================= */

    await db.collection("sales").deleteOne(
      {
        _id: sale._id,
      },
      { session }
    );

    /* =========================
       COMMIT
    ========================= */

    await session.commitTransaction();

    return NextResponse.json({
      success: true,

      message:
        "Sale deleted and stock restored successfully.",

      restored: {
        productId:
          product._id.toString(),

        batchId,

        quantity:
          saleQuantity,

        newBatchStock:
          currentBatchQuantity +
          saleQuantity,

        newTotalStock:
          newStock,
      },
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(
      "DELETE SALE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to delete sale.",
      },
      {
        status: 400,
      }
    );

  } finally {

    await session.endSession();

  }
}