"use client";

import { useEffect, useState } from "react";

export default function CampaignDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/register");

      const data = await res.json();

      if (data.success) {
        setRegistrations(data.registrations);
        setStats(data.stats);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();

    return (
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.registrationCode.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}

      <div className="sticky top-0 z-20 bg-white shadow">

        <div className="p-4">

          <h1 className="text-xl font-bold">
            Campaign Dashboard
          </h1>

          <p className="text-sm text-gray-500">
            Silver Dining Festival
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3 px-4 pb-4">

          <Card
            title="Total"
            value={stats.totalRegistrations}
          />

          <Card
            title="Today"
            value={stats.todayRegistrations}
          />

        </div>

        <div className="px-4 pb-4">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search Name / Phone / Reg ID"
            className="w-full rounded-xl border bg-gray-50 p-3 outline-none"
          />

        </div>

      </div>

      {/* List */}

      <div className="space-y-3 p-4">

        {filtered.length === 0 && (
          <div className="text-center text-gray-500">
            No registrations found.
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r._id}
            className="rounded-2xl bg-white p-4 shadow"
          >

            <div className="flex items-center justify-between">

              <h2 className="font-bold">
                {r.registrationCode}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  r.reward.brand === "SIVAAH"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r.reward.brand}
              </span>

            </div>

            <div className="mt-3">

              <p className="text-lg font-semibold">
                {r.name}
              </p>

              <p className="text-gray-600">
                {r.phone}
              </p>

            </div>

            <div className="mt-3 rounded-xl bg-gray-100 p-3">

              <p className="font-semibold">
                🎁 {r.reward.title}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {r.reward.subtitle}
              </p>

            </div>

            <p className="mt-3 text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleString()}
            </p>

          </div>
        ))}

      </div>

      {/* Refresh */}

      <button
        onClick={loadData}
        className="fixed bottom-5 right-5 rounded-full bg-black px-5 py-3 text-white shadow-lg"
      >
        Refresh
      </button>

    </main>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-1 text-3xl font-bold">
        {value ?? 0}
      </h2>

    </div>
  );
}