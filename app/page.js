"use client";

import Link from "next/link";

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