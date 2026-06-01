
import { NextResponse } from "next/server";

import mongoose from "mongoose";

import crypto from "crypto";

import connectDB from "@/lib/mongodb";

export async function POST(req) {

  try {

    /* =========================
       CONNECT DATABASE
    ========================= */

    await connectDB();

    const body =
      await req.json();

    const db =
      mongoose.connection.db;

    /* =========================
       CREATE PRODUCT DATA
    ========================= */

    const productData = {

      ...body,

      material:
        "925 Silver",

      isActive:
        true,

      createdAt:
        new Date(),

      updatedAt:
        new Date(),
    };

    /* =========================
       INSERT PRODUCT
    ========================= */

    const result =
      await db
        .collection(
          "products"
        )
        .insertOne(
          productData
        );

    /* =========================
       AUTO CREATE CERTIFICATE
    ========================= */

    const existingCertificate =
      await db
        .collection(
          "certificates"
        )
        .findOne({

          productId:
            result.insertedId,
        });

    if (
      !existingCertificate
    ) {

      /* =========================
         GENERATE UNIQUE SLUG
      ========================= */

      const certificateSlug =

        `svh-cert-${
          crypto.randomInt(
            1000,
            9999
          )
        }`;

      /* =========================
         INSERT CERTIFICATE
      ========================= */

      await db
        .collection(
          "certificates"
        )
        .insertOne({

          productId:
            result.insertedId,

          slug:
            certificateSlug,

          productName:
            body.name || "",

          productImage:
            body.images?.[0] || "",

          purity:
            "925 Sterling Silver",

          weight:
            body.grams || 0,

          batchid:
            body.batchid || "",

          createdAt:
            new Date(),
        });
    }

    /* =========================
       AUTO RUN PRICE SYNC
    ========================= */

    try {

      await fetch(

        "https://sivaaherp.vercel.app/api/sync-prices",

        {
          method:
            "POST",
        }
      );

    } catch (syncError) {

      console.log(
        "Price sync failed:",
        syncError
      );
    }

    /* =========================
       SUCCESS RESPONSE
    ========================= */

    return NextResponse.json({

      success:
        true,

      insertedId:
        result.insertedId,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(

      {

        success:
          false,

        error:
          error.message,
      },

      {

        status:
          500,
      }
    );
  }
}
