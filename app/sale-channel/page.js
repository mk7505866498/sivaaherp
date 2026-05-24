"use client";

import {
  useEffect,
  useState,
} from "react";

export default function Page() {

  const [costs, setCosts] =
    useState([]);

  const [channels, setChannels] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      key: "",
      selectedCosts: [],
    });

  // FETCH COSTS

  const fetchCosts =
    async () => {

      try {

        const res = await fetch(
          "/api/cost-config/all"
        );

        const data =
          await res.json();

        if (data.success) {

          setCosts(
            Array.isArray(
              data.data
            )
              ? data.data
              : []
          );
        }

      } catch (error) {

        console.log(error);

      }
    };

  // FETCH CHANNELS

  const fetchChannels =
    async () => {

      try {

        const res = await fetch(
          "/api/sale-channel/all"
        );

        const data =
          await res.json();

        if (data.success) {

          setChannels(
            Array.isArray(
              data.data
            )
              ? data.data
              : []
          );
        }

      } catch (error) {

        console.log(error);

      }
    };

  useEffect(() => {

    fetchCosts();

    fetchChannels();

  }, []);

  const handleCheckbox =
    (key) => {

      if (
        form.selectedCosts.includes(
          key
        )
      ) {

        setForm({
          ...form,

          selectedCosts:
            form.selectedCosts.filter(
              (c) =>
                c !== key
            ),
        });

      } else {

        setForm({
          ...form,

          selectedCosts: [
            ...form.selectedCosts,
            key,
          ],
        });
      }
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const res = await fetch(
          "/api/sale-channel/add",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              form
            ),
          }
        );

        const data =
          await res.json();

        alert(data.message);

        setForm({
          name: "",
          key: "",
          selectedCosts: [],
        });

        fetchChannels();

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Sale Channels
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-6 mb-10"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <input
            placeholder="Channel Name"
            className="border p-3 rounded-xl"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Channel Key"
            className="border p-3 rounded-xl"
            value={form.key}
            onChange={(e) =>
              setForm({
                ...form,
                key:
                  e.target.value.toLowerCase(),
              })
            }
            required
          />

        </div>

        <div className="mt-8">

          <h2 className="font-bold mb-4">
            Select Costs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {costs.map((cost) => (

              <label
                key={cost._id}
                className="flex items-start gap-3 bg-gray-100 p-4 rounded-xl"
              >

                <input
                  type="checkbox"
                  checked={form.selectedCosts.includes(
                    cost.key
                  )}
                  onChange={() =>
                    handleCheckbox(
                      cost.key
                    )
                  }
                  className="mt-1"
                />

                <div>

                  <p className="font-semibold">
                    {cost.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {
                      cost.description
                    }
                  </p>

                  <p className="text-sm mt-1">

                    {cost.type ===
                    "percent"
                      ? `${cost.value}%`
                      : `₹${cost.value}`}

                  </p>

                </div>

              </label>
            ))}

          </div>

        </div>

        <button
          type="submit"
          className="mt-8 bg-black text-white px-8 py-3 rounded-xl"
        >
          {loading
            ? "Creating..."
            : "Create Channel"}
        </button>

      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {channels.map((channel) => (

          <div
            key={channel._id}
            className="bg-white rounded-2xl shadow p-5"
          >

            <h2 className="text-2xl font-bold">
              {channel.name}
            </h2>

            <p className="text-gray-500">
              {channel.key}
            </p>

            <div className="mt-5">

              <h3 className="font-bold mb-2">
                Applied Costs
              </h3>

              <div className="flex flex-wrap gap-2">

                {channel.selectedCosts.map(
                  (cost) => (

                    <span
                      key={cost}
                      className="bg-black text-white px-3 py-1 rounded-full text-sm"
                    >
                      {cost}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}