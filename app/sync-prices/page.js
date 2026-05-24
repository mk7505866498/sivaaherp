"use client";

import { useState } from "react";

export default function SyncPricesPage() {

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const syncPrices = async () => {

    try {

      setLoading(true);

      setMessage("");

      const res = await fetch(
        "/api/sync-prices",
        {
          method: "POST",
        }
      );

      const data =
        await res.json();

      if (data.success) {

        setMessage(
          `Successfully synced ${data.updatedCount} products`
        );

      } else {

        setMessage(
          "Something went wrong"
        );
      }

    } catch (err) {

      console.log(err);

      setMessage(
        "Server error"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#0F1115] text-white p-8">

      <div className="max-w-3xl mx-auto">

        <div className="bg-[#171A21] border border-[#262B36] rounded-3xl p-10">

          <div className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-3">
            Sivaah ERP
          </div>

          <h1 className="text-4xl font-bold mb-5">

            Sync Live Website Prices

          </h1>

          <p className="text-gray-400 leading-8 mb-10">

            This will calculate latest pricing
            from pricing engine and update
            product Selling Price & MRP
            across your main website.

          </p>

          <button
            onClick={syncPrices}
            disabled={loading}
            className="bg-[#B08D57] hover:bg-[#C8A36A] transition-all px-8 py-4 rounded-2xl text-light 
            font-semibold"
          >

            {
              loading
                ? "Syncing..."
                : "Sync Product Prices"
            }

          </button>

          {message && (

            <div className="mt-8 text-lg text-[#D6B98C]">

              {message}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}