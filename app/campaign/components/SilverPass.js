"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const BG_IMAGE =
    "https://res.cloudinary.com/df67hp5yk/image/upload/v1784358305/ChatGPT_Image_Jul_18_2026_12_30_28_PM_donb5y.png";

export default function SilverPass({
    loading,
    user,
    reward,
    registrationCode,
}) {
    

    const loadingMessages = [
        "Searching Tonight's Rewards...",
        "Selecting Your Reward...",
        "Preparing Your Silver Pass...",
        "Curating Best For You...",
    ];

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const m1 = setTimeout(() => setMessageIndex(1), 700);
        const m2 = setTimeout(() => setMessageIndex(2), 1400);

       

        return () => {
            clearTimeout(m1);
            clearTimeout(m2);
            
        };
    }, []);
    const isSivaah = reward?.brand === "SIVAAH";

 const rewardBg = isSivaah
  ? "rgba(255,250,242,0.94)"
  : "rgba(255,245,245,0.94)";

   const rewardText = isSivaah
  ? "#7A5A22"
  : "#8B1E1E";
    return (
        <motion.section
            className="fixed inset-0 overflow-y-auto overflow-x-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {/* Background */}
            {/* Background */}

            <img
                src={BG_IMAGE}
                alt=""
                className="fixed inset-0 h-screen w-screen object-cover"
            />

            <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px]" />

            <div className="relative z-10 flex min-h-screen justify-center px-6 py-10">

                {loading ? (

                    <div className="w-full max-w-sm text-center">

                        <motion.div
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 8,
                                ease: "linear",
                            }}
                            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl"
                        >

                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                }}
                                className="h-12 w-12 rounded-full bg-white"
                            />

                        </motion.div>

                        <AnimatePresence mode="wait">

                            <motion.h2
                                key={messageIndex}
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                }}
                                transition={{
                                    duration: .3,
                                }}
                                className="mt-8 text-2xl font-bold text-white"
                            >
                                {loadingMessages[messageIndex]}
                            </motion.h2>

                        </AnimatePresence>

                        <p className="mt-3 text-sm text-white/70">
                            Every guest receives one exclusive reward.
                        </p>

                        <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/20">

                            <motion.div
                                initial={{
                                    width: 0,
                                }}
                                animate={{
                                    width: "100%",
                                }}
                                transition={{
                                    duration: 2,
                                }}
                                className="h-full rounded-full bg-white"
                            />

                        </div>

                    </div>

                ) : (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 40,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.5,
                        }}
                        className="w-full max-w-sm"
                    >
                        {/* Celebration */}

                        <div className="text-center">

                            <motion.div
                                initial={{
                                    scale: 0,
                                    rotate: -25,
                                }}
                                animate={{
                                    scale: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 180,
                                }}
                                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl"
                            >
                                <span className="text-3xl">🎉</span>
                            </motion.div>

                            <p className="mt-3 text-xs uppercase tracking-[0.35em] text-white/70">
                                Congratulations
                            </p>

                            <h2 className="mt-2 text-4xl font-black text-white">
                                You Unlocked
                            </h2>

                        </div>

                        {/* Reward Card */}

                        <motion.div

                            initial={{
                                opacity: 0,
                                y: 25,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: .2,
                            }}
                            className="relative mt-4 overflow-hidden rounded-3xl border border-white/30 shadow-2xl"
                            style={{
                                background: rewardBg,
                                backdropFilter: "blur(18px)",
                            }}
                        >
                            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">

                                <div className="absolute -left-20 top-0 h-full w-24 rotate-12 bg-white/40 blur-xl" />

                            </div>
                            {/* Top */}

                            <div className="border-b border-black/10 px-6 py-4">

                                <p
                                    className="text-center text-[11px] uppercase tracking-[0.45em]"
                                    style={{
                                        color: rewardText,
                                        opacity: 0.8,
                                    }}
                                >
                                    {reward.brand}
                                </p>

                            </div>

                            {/* Reward */}

                            <div className="px-8 pt-6 pb-8 text-center">


                                <motion.h1
                                    initial={{ scale: .8 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: .35,
                                        type: "spring",
                                    }}
                                    className="text-5xl font-black tracking-tight"
                                    style={{
                                        color: rewardText,
                                    }}
                                >
                                    {reward.title}
                                </motion.h1>

                                <p
                                    className="mt-5 text-base leading-7"
                                    style={{
                                        color: rewardText,
                                        opacity: 0.85,
                                    }}
                                >
                                    {reward.subtitle}
                                </p>

                            </div>
                            <div className="border-t border-black/10 px-6 py-4">

                                <p
                                    className="text-center text-[11px] uppercase tracking-[0.35em]"
                                    style={{
                                        color: rewardText,
                                        opacity: .75,
                                    }}
                                >
                                    Exclusive Silver Pass Reward
                                </p>

                            </div>
                        </motion.div>

                        {/* Silver Pass */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: .45,
                            }}
                            className="mt-5 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl"
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                                        Silver Pass
                                    </p>

                                    <h3 className="mt-1 text-2xl font-bold text-white">
                                        #{registrationCode}
                                    </h3>

                                </div>

                                <div className="text-5xl">
                                    ✨
                                </div>

                            </div>

                            <div className="my-3 border-t border-white/20" />

                            <div>

                                <p className="text-xs text-white/60">
                                    Guest
                                </p>

                                <p className="text-lg font-semibold text-white">
                                    {user?.name}
                                </p>

                            </div>

                        </motion.div>

                        {/* Instruction */}

                        <p className="mt-1 text-center text-sm leading-6 text-white/80">
                            Show this screen to our staff
                            to claim your reward and collect
                            your Silver Pass.
                        </p>

                        {/* CTA */}

                        <button
                            className="mt-3 w-full rounded-full bg-white py-3 text-lg font-bold text-black transition hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Claim at Counter
                        </button>

                    </motion.div>

                )}

            </div>

        </motion.section>

    );
}