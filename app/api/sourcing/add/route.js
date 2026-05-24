import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Sourcing from "@/models/Sourcing";

import generateBatchId from "@/utils/generateBatchId";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      quantityInGram,
      silverRate,
      labourPerGram,
      vendor,
      date,
    } = body;

    if (
      !quantityInGram ||
      !silverRate ||
      !labourPerGram ||
      !vendor ||
      !date
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields required",
        },
        { status: 400 }
      );
    }

    const batchId = generateBatchId(
      date,
      silverRate,
      labourPerGram
    );

    const totalCost =
      quantityInGram *
      (silverRate + labourPerGram);

    const newSourcing = await Sourcing.create({
      batchId,
      quantityInGram,
      silverRate,
      labourPerGram,
      vendor,
      totalCost,
      remainingQty: quantityInGram,
      date,
    });

    return NextResponse.json({
      success: true,
      data: newSourcing,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}