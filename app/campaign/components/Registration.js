"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const BG_IMAGE =
  "https://res.cloudinary.com/df67hp5yk/image/upload/v1784358300/ChatGPT_Image_Jul_18_2026_12_24_31_PM_nz4odf.png";

export default function Registration({
  onSubmit,
  defaultValues = {},
}) {
  const [form, setForm] = useState({
    name: defaultValues.name || "",
    phone: defaultValues.phone || "",
  });

  const [followed, setFollowed] = useState({
    sivaah: false,
    kanak: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFollow = (type, url) => {
    window.open(url, "_blank");

    setFollowed((prev) => ({
      ...prev,
      [type]: true,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return setError("Please enter your name.");
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return setError("Please enter a valid mobile number.");
    }

    if (!followed.sivaah || !followed.kanak) {
      return setError(
        "Please open both Instagram pages before continuing."
      );
    }

    setError("");
    const response = await fetch("/api/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(form),
});

const data = await response.json();

if (!response.ok) {
  return setError(data.message);
}

onSubmit(data);
  
  };

  return (
    <motion.section
      className="fixed inset-0 h-screen w-screen overflow-hidden"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Background */}

      <img
        src={BG_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Lighter overlay so image is visible */}

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

      {/* Content */}

      <div className="relative z-10 flex h-full items-center justify-center p-5">

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white">
            Your Silver Pass
          </h2>

          <p className="mt-1 text-sm text-white/80">
            Complete your details to join tonight's experience.
          </p>

          {/* Name */}

          <div className="mt-5">
            <label className="mb-2 block text-sm text-white/80">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white"
            />
          </div>

          {/* Phone */}

          <div className="mt-4">
            <label className="mb-2 block text-sm text-white/80">
              Mobile Number
            </label>

            <input
              type="tel"
              name="phone"
              maxLength={10}
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white"
            />
          </div>

          {/* PART 2 STARTS HERE */}
                    {/* Follow Instagram */}

          <div className="mt-5 space-y-3">

            <button
              type="button"
              onClick={() =>
                handleFollow(
                  "sivaah",
                  "https://instagram.com/sivaah.in"
                )
              }
              className={`flex w-full items-center justify-center rounded-xl border py-3 text-sm font-medium transition-all duration-300 ${
                followed.sivaah
                  ? "border-green-400 bg-green-500 text-white"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {followed.sivaah
                ? "✓ Sivaah Instagram Opened"
                : "Follow @sivaah.in"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleFollow(
                  "kanak",
                  "https://instagram.com/kanakayodhya"
                )
              }
              className={`flex w-full items-center justify-center rounded-xl border py-3 text-sm font-medium transition-all duration-300 ${
                followed.kanak
                  ? "border-green-400 bg-green-500 text-white"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {followed.kanak
                ? "✓ Kanak Instagram Opened"
                : "Follow Kanak Restaurant"}
            </button>

          </div>

          {/* Error */}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-center text-sm text-red-100"
            >
              {error}
            </motion.div>
          )}

          {/* CTA */}

          <button
            type="submit"
            className={`mt-5 w-full rounded-full py-3.5 text-base font-semibold transition-all duration-300 ${
              followed.sivaah && followed.kanak
                ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                : "cursor-pointer bg-white/70 text-black"
            }`}
          >
            Get My Silver Pass
          </button>

          <p className="mt-3 text-center text-xs text-white/70">
            Takes less than 30 seconds.
          </p>

        </motion.form>

      </div>

    </motion.section>
  );
}