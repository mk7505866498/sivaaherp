import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";

const rewards = [
  {
    id: "SIV001",
    brand: "SIVAAH",
    title: "₹200 OFF",
    subtitle: "Get ₹200 OFF on any Sivaah 925 Sterling Silver jewellery purchase. No minimum order value.",
    type: "voucher",
    weight: 30,
  },
  {
    id: "KAN004",
    brand: "KANAK",
    title: "Free Mocktail",
    subtitle: "Redeem one complimentary signature mocktail during your next visit.",
    type: "drink",
    weight: 18,
  },
  {
    id: "SIV002",
    brand: "SIVAAH",
    title: "₹300 OFF",
    subtitle: "Enjoy ₹300 OFF when you shop Sivaah 925 Sterling Silver jewellery worth ₹1,199 or more.",
    type: "voucher",
    weight: 22,
  },
    {
    id: "KAN003",
    brand: "KANAK",
    title: "Free Coffee",
    subtitle: "Enjoy a complimentary coffee on your next visit to Kanak Restaurant.",
    type: "drink",
    weight: 22,
  },
  {
    id: "SIV003",
    brand: "SIVAAH",
    title: "₹400 OFF",
    subtitle: "Get ₹400 OFF on Sivaah 925 Sterling Silver jewellery purchases of ₹1,499 or above.",
    type: "voucher",
    weight: 14,
  },
  {
    id: "KAN002",
    brand: "KANAK",
    title: "15% OFF Next Visit",
    subtitle: "Enjoy 15% OFF on your next dining experience at Kanak Restaurant.",
    type: "discount",
    weight: 15,
  },
  {
    id: "SIV004",
    brand: "SIVAAH",
    title: "₹500 OFF",
    subtitle: "Unlock ₹500 OFF when you purchase Sivaah 925 Sterling Silver jewellery worth ₹1,999 or more.",
    type: "voucher",
    weight: 8,
  },
   {
    id: "KAN001",
    brand: "KANAK",
    title: "10% OFF Next Visit",
    subtitle: "Get 10% OFF on your total bill during your next visit to Kanak Restaurant.",
    type: "discount",
    weight: 28,
  },
  {
    id: "SIV005",
    brand: "SIVAAH",
    title: "Flat 20% OFF",
    subtitle: "Enjoy a flat 20% discount on your Sivaah 925 Sterling Silver jewellery purchase.",
    type: "discount",
    weight: 3,
  },
  {
    id: "KAN005",
    brand: "KANAK",
    title: "Buy 2 Desserts, Get 1 Free",
    subtitle: "Order any two desserts and enjoy one additional dessert absolutely free.",
    type: "dessert",
    weight: 10,
  },
];

function getRandomReward() {
  const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);

  let random = Math.random() * totalWeight;

  for (const reward of rewards) {
    random -= reward.weight;

    if (random <= 0) {
      return reward;
    }
  }

  return rewards[0];
}

export async function POST(request) {
  try {
    await connectDB();

    const db = mongoose.connection.db;

    const body = await request.json();

    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and phone are required.",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate registrations
    const existing = await db.collection("campaignregistrations").findOne({
      phone,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "This mobile number is already registered.",
        },
        { status: 400 }
      );
    }

    // Generate sequential registration code
    const totalRegistrations = await db
      .collection("campaignregistrations")
      .countDocuments();

    const registrationCode =
      "SD26" + String(totalRegistrations + 1).padStart(5, "0");

    // Pick reward
    const reward = getRandomReward();

    const registration = {
      registrationCode,

      name,

      phone,

      reward,

      createdAt: new Date(),
    };

    await db
      .collection("campaignregistrations")
      .insertOne(registration);

    return NextResponse.json({
      success: true,

      user: {
        name,
        phone,
      },

      registrationCode,

      reward,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}