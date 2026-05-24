"use client";

import { useEffect, useState } from "react";

import AddSourcingForm from "@/components/AddSourcingForm";
import SourcingTable from "@/components/SourcingTable";

export default function Page() {

  const [sourcings, setSourcings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchSourcings = async () => {

    try {

      const res = await fetch(
        "/api/sourcing/all"
      );

      const data = await res.json();

      if (data.success) {

        setSourcings(
          Array.isArray(data.data)
            ? data.data
            : []
        );

      } else {

        setSourcings([]);

      }

    } catch (error) {

      console.log(error);

      setSourcings([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchSourcings();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Sourcing Management
      </h1>

      <AddSourcingForm
        fetchSourcings={
          fetchSourcings
        }
      />

      <div className="mt-10">

        {loading ? (

          <p>
            Loading Sourcings...
          </p>

        ) : (

          <SourcingTable
            sourcings={sourcings}
          />

        )}

      </div>

    </div>
  );
}