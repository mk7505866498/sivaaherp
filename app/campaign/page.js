"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import Hero from "./components/Hero";
import Registration from "./components/Registration";
import SilverPass from "./components/SilverPass";

export default function CampaignPage() {
  const [step, setStep] = useState(1);

  const [registration, setRegistration] = useState(null);
const [loading, setLoading] = useState(false);
  const handleHeroContinue = () => {
    setStep(2);
  };

 const handleRegistration = async (form) => {

  // Open Silver Pass immediately
  setLoading(true);
  setStep(3);

  const startTime = Date.now();

  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  const data = await response.json();

  if (!response.ok) {
    setStep(2);
    setLoading(false);
    throw new Error(data.message);
  }

  // Ensure minimum 2.5 second animation
  const elapsed = Date.now() - startTime;

  if (elapsed < 2500) {
    await new Promise(resolve =>
      setTimeout(resolve, 2500 - elapsed)
    );
  }

  setRegistration(data);
  setLoading(false);
};

  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <Hero
            key="hero"
            onContinue={handleHeroContinue}
          />
        )}

        {step === 2 && (
          <Registration
            key="registration"
            onSubmit={handleRegistration}
            defaultValues={{
              name: registration?.user?.name || "",
              phone: registration?.user?.phone || "",
            }}
          />
        )}

    {step === 3 && (
  <SilverPass
    key="reward"
    loading={loading}
    user={registration?.user}
    reward={registration?.reward}
    registrationCode={registration?.registrationCode}
  />
)}
      </AnimatePresence>
    </main>
  );
}