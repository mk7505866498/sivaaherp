"use client";

import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useEffect, useRef } from "react";

const HERO_IMAGE =
  "https://res.cloudinary.com/df67hp5yk/image/upload/v1784358675/ChatGPT_Image_Jul_18_2026_12_40_49_PM_iyq7pj.png";

export default function Hero({ onContinue }) {
  const started = useRef(false);
  const touchStartY = useRef(0);

  const goNext = () => {
    if (started.current) return;

    started.current = true;
    onContinue();
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 30) {
        goNext();
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;

    if (touchStartY.current - endY > 70) {
      goNext();
    }
  };

  return (
    <motion.section
      className="fixed inset-0 h-screen w-screen overflow-hidden cursor-pointer"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={goNext}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background */}

      <motion.img
        src={HERO_IMAGE}
        alt="The Silver Dinner Experience"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 8,
          ease: "easeOut",
        }}
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

      {/* Content */}

      <div className="relative z-10 flex h-full flex-col justify-end px-7 pb-12 text-white">

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="uppercase tracking-[0.35em] text-xs text-white/80"
        >
          SIVAAH × KANAK
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-5xl font-bold leading-tight"
        >
          The Silver
          <br />
          Dinner
          <br />
          Experience
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6 text-lg leading-8 text-white/90"
        >
          Tonight, one guest dining at Kanak will receive
          <br />
          <span className="font-semibold">
            Real 925 Silver Jewellery.
          </span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-sm text-white/70"
        >
          Every guest also receives an exclusive dining reward.
        </motion.p>

        {/* Bottom Hint */}

        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
          }}
          className="mt-14 flex flex-col items-center text-white/80"
        >
          <ChevronUp size={26} />

          <p className="mt-2 text-xs uppercase tracking-[0.25em]">
            Tap Anywhere • Swipe Up
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}