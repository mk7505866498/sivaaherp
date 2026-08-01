import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";

const rewards = [
  {
    id: "SIV001",
    brand: "SIVAAH",
    title: "₹200 OFF",
    subtitle: "Save ₹200 on jewellery purchases of ₹999 or more at Sivaah.in.",
    type: "voucher",
    weight: 28,
  },

  {
    id: "SIV002",
    brand: "SIVAAH",
    title: "₹300 OFF",
    subtitle: "Save ₹300 on jewellery purchases of ₹1,499 or more at Sivaah.in.",
    type: "voucher",
    weight: 22,
  },

  {
    id: "SIV003",
    brand: "SIVAAH",
    title: "₹400 OFF",
    subtitle: "Save ₹400 on jewellery purchases of ₹1,999 or more at Sivaah.in.",
    type: "voucher",
    weight: 14,
  },

  {
    id: "SIV004",
    brand: "SIVAAH",
    title: "₹500 OFF",
    subtitle: "Save ₹500 on jewellery purchases of ₹2,999 or more at Sivaah.in.",
    type: "voucher",
    weight: 8,
  },

  {
    id: "SIV005",
    brand: "SIVAAH",
    title: "20% OFF Rakhi Hamper",
    subtitle: "Get 20% OFF on any Customized Rakhi Hamper at Sivaah.in.",
    type: "discount",
    weight: 10,
  },

  {
    id: "SIV006",
    brand: "SIVAAH",
    title: "15% OFF Rakhi Hamper",
    subtitle: "Get 15% OFF on any Customized Rakhi Hamper at Sivaah.in.",
    type: "discount",
    weight: 12,
  },

  {
    id: "SIV007",
    brand: "SIVAAH",
    title: "🎁 FREE Silver Ring Worth ₹899",
    subtitle: "Get a FREE Silver Ring worth up to ₹899 on purchases of ₹3,999 or more at Sivaah.in.",
    type: "gift",
    weight: 6,
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