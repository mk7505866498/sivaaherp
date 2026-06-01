import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

function generateCertificateId() {

  const random =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `SVH-CERT-${random}`;
}

export async function POST(req) {

  try {

    await connectDB();

    const body =
      await req.json();

    const {
      productId,
    } = body;

    const db =
      mongoose.connection.db;

    /* CHECK EXISTING */

    const existing =
      await db
        .collection("certificates")
        .findOne({

          productId:
            productId,
        });

    if (existing) {

      return NextResponse.json({

        success: true,

        exists: true,

        slug:
          existing.slug,
      });
    }

    /* FETCH PRODUCT */

    const product =
      await db
        .collection("products")
        .findOne({

          _id:
            new mongoose.Types.ObjectId(
              productId
            ),
        });

    if (!product) {

      return NextResponse.json(

        {
          success: false,
          message:
            "Product not found",
        },

        { status: 404 }
      );
    }

    /* CREATE CERTIFICATE */

    const certificateId =
      generateCertificateId();

    const slug =
      certificateId
        .toLowerCase();

    const certificate = {

      certificateId,

      slug,

      productId,

      productName:
        product.name,

      productImage:
        product.images?.[0] || "",

      batchid:
        product.batchid,

      weight:
        product.grams,

      purity:
        "925 Sterling Silver",

      status:
        "verified",

      createdAt:
        new Date(),
    };

    await db
      .collection(
        "certificates"
      )
      .insertOne(
        certificate
      );

    return NextResponse.json({

      success: true,

      exists: false,

      slug,
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