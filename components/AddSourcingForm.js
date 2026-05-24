"use client";

import { useState } from "react";

export default function AddSourcingForm({
  fetchSourcings,
}) {
  const [form, setForm] = useState({
    quantityInGram: "",
    silverRate: "",
    labourPerGram: "",
    vendor: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        "/api/sourcing/add",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Sourcing Added");

        setForm({
          quantityInGram: "",
          silverRate: "",
          labourPerGram: "",
          vendor: "",
          date: "",
        });

        fetchSourcings();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white shadow p-6 rounded-xl"
    >
      <input
        type="number"
        name="quantityInGram"
        placeholder="Quantity in Gram"
        value={form.quantityInGram}
        onChange={handleChange}
        className="border p-3 rounded"
        required
      />

      <input
        type="number"
        name="silverRate"
        placeholder="Silver Rate/g"
        value={form.silverRate}
        onChange={handleChange}
        className="border p-3 rounded"
        required
      />

      <input
        type="number"
        name="labourPerGram"
        placeholder="Labour/g"
        value={form.labourPerGram}
        onChange={handleChange}
        className="border p-3 rounded"
        required
      />

      <input
        type="text"
        name="vendor"
        placeholder="Vendor"
        value={form.vendor}
        onChange={handleChange}
        className="border p-3 rounded"
        required
      />

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="border p-3 rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-3 rounded hover:bg-gray-800"
      >
        {loading
          ? "Adding..."
          : "Add Sourcing"}
      </button>
    </form>
  );
}