"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
const modules = [

  {
    title: "Sourcing",
    desc:
      "Manage sourcing batches, vendors & inventory inflow.",
    href: "/sourcing",
    icon: "📦",
  },

  {
    title: "Cost Configs",
    desc:
      "Manage packaging, shipping, commissions & discounts.",
    href: "/cost-config",
    icon: "💰",
  },

  {
    title: "Sale Channels",
    desc:
      "Configure Amazon, Website, Offline & Marketplace channels.",
    href: "/sale-channel",
    icon: "🛒",
  },

  {
    title: "Pricing Dashboard",
    desc:
      "Analyze margins, settlements & profitability across channels.",
    href: "/cost-price",
    icon: "📊",
  },

  {
    title: "Sync Live Prices",
    desc:
      "Push updated Selling Price & MRP to main website.",
    href: "/sync-prices",
    icon: "🔄",
  },
  {
  title: "Products",
  desc:
      "Add,Edit Products",
  href: "/products",
   icon: "📊",
}

];

export default function HomePage() {
const [silverRate, setSilverRate] =
  useState(0);

const [editing, setEditing] =
  useState(false);

useEffect(() => {

  fetchSilverRate();

}, []);

async function fetchSilverRate() {

  try {

    const res =
      await fetch(
        "/api/metalrates/silver"
      );

    const data =
      await res.json();

    if (data.success) {

      setSilverRate(
        data.ratePerGram
      );
    }

  } catch (error) {

    console.log(error);
  }
}

async function updateSilverRate() {

  try {

    const res =
      await fetch(
        "/api/metalrates/silver",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              ratePerGram:
                Number(
                  silverRate
                )
            })
        }
      );

    const data =
      await res.json();

    if (!data.success) {

      throw new Error(
        "Update Failed"
      );
    }

    alert(
      "Silver Rate Updated Successfully"
    );

    setEditing(false);

    fetchSilverRate();

  } catch (error) {

    console.log(error);

    alert(
      "Failed To Update Silver Rate"
    );
  }
}
  return (

    <div className="min-h-screen bg-[#0F1115] text-white p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-12">

          <div className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-3">
            Sivaah ERP
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Operations Dashboard
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl leading-8">
            Centralized pricing, sourcing, cost &
            profitability management system for Sivaah.
          </p>

        </div>
<div className="bg-gradient-to-r from-[#171A21] to-[#1E232D] border border-[#B08D57] rounded-3xl p-8 mb-8">

  <div className="text-sm uppercase tracking-widest text-gray-400 mb-2">

    Current Silver Rate

  </div>

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-5xl font-bold text-[#D6B98C]">

        ₹{silverRate}

      </h2>

      <p className="text-gray-400 mt-2">

        Per Gram

      </p>

    </div>

    <button

      onClick={() =>
        setEditing(true)
      }

      className="bg-[#B08D57] text-black px-5 py-3 rounded-xl font-semibold"
    >

      Change Rate

    </button>

  </div>


</div>
  {
  editing && (

    <div className="bg-[#171A21] border border-[#262B36] rounded-3xl p-6 mb-8">

      <h3 className="text-xl font-semibold mb-4">
        Update Silver Rate
      </h3>

      <input
        type="number"
        value={silverRate}
       onChange={(e) =>
  setSilverRate(
    Number(e.target.value)
  )
}
        className="w-full bg-[#0F1115] border border-[#262B36] rounded-xl p-3 mb-4"
      />

      <div className="flex gap-3">

        <button
          onClick={updateSilverRate}
          className="bg-[#B08D57] text-black px-5 py-3 rounded-xl font-semibold"
        >
          Save
        </button>

        <button
          onClick={() =>
            setEditing(false)
          }
          className="border border-gray-500 px-5 py-3 rounded-xl"
        >
          Cancel
        </button>

      </div>

    </div>

  )
}
        {/* GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {modules.map((item, i) => (

            <Link
              key={i}
              href={item.href}
              className="group"
            >

              <div className="bg-[#171A21] border border-[#262B36] rounded-3xl p-7 h-full hover:border-[#B08D57] transition-all duration-300 hover:-translate-y-1">

                <div className="text-5xl mb-5">
                  {item.icon}
                </div>

                <h2 className="text-2xl font-semibold mb-3 group-hover:text-[#D6B98C] transition-colors">

                  {item.title}

                </h2>

                <p className="text-gray-400 leading-7 text-sm">

                  {item.desc}

                </p>

                <div className="mt-6 text-sm tracking-wider uppercase text-[#B08D57]">

                  Open Module →

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </div>
  );
}