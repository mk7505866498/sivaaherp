"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import Hero from "./components/Hero";
import Registration from "./components/Registration";
import SilverPass from "./components/SilverPass";

export default function CampaignPage() {
  const [step, setStep] = useState(1);

  const [registration, setRegistration] = useState(null);

  const handleHeroContinue = () => {
    setStep(2);
  };

  const handleRegistration = (data) => {
    setRegistration(data);
    setStep(3);
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

        {step === 3 && registration && (
          <SilverPass
            key="reward"
            user={registration.user}
            reward={registration.reward}
            registrationCode={registration.registrationCode}
          />
        )}
      </AnimatePresence>
    </main>
  );
}