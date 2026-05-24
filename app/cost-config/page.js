"use client";

import {
  useEffect,
  useState,
} from "react";

export default function Page() {

  const [costs, setCosts] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      key: "",
      description: "",
      type: "flat",
      value: "",

      applicableOn: [],
    });

  const platforms = [
    "website",
    "offline",
    "amazon",
    "flipkart",
    "myntra",
    "nykaa",
  ];

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

  useEffect(() => {
    fetchCosts();
  }, []);

  const handleCheckbox =
    (platform) => {

      if (
        form.applicableOn.includes(
          platform
        )
      ) {

        setForm({
          ...form,

          applicableOn:
            form.applicableOn.filter(
              (p) =>
                p !== platform
            ),
        });

      } else {

        setForm({
          ...form,

          applicableOn: [
            ...form.applicableOn,
            platform,
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
          "/api/cost-config/add",
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
          description: "",
          type: "flat",
          value: "",
          applicableOn: [],
        });

        fetchCosts();

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Cost Engine
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-2xl p-6 mb-10"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <input
            placeholder="Cost Name"
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
            placeholder="Unique Key"
            className="border p-3 rounded-xl"
            value={form.key}
            onChange={(e) =>
              setForm({
                ...form,
                key:
                  e.target.value,
              })
            }
            required
          />

          <select
            className="border p-3 rounded-xl"
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type:
                  e.target.value,
              })
            }
          >

            <option value="flat">
              Flat
            </option>

            <option value="percent">
              Percent
            </option>

          </select>

          <input
            type="number"
            placeholder="Value"
            className="border p-3 rounded-xl"
            value={form.value}
            onChange={(e) =>
              setForm({
                ...form,
                value:
                  Number(
                    e.target.value
                  ),
              })
            }
            required
          />

        </div>

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded-xl mt-5"
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target.value,
            })
          }
        />

        <div className="mt-6">

          <h2 className="font-bold mb-3">
            Applicable On
          </h2>

          <div className="flex gap-5 flex-wrap">

            {platforms.map(
              (platform) => (

                <label
                  key={platform}
                  className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl"
                >

                  <input
                    type="checkbox"
                    checked={form.applicableOn.includes(
                      platform
                    )}
                    onChange={() =>
                      handleCheckbox(
                        platform
                      )
                    }
                  />

                  {platform}

                </label>
              )
            )}

          </div>

        </div>

        <button
          type="submit"
          className="mt-8 bg-black text-white px-8 py-3 rounded-xl"
        >
          {loading
            ? "Adding..."
            : "Add Cost"}
        </button>

      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {Array.isArray(costs) &&
          costs.map((cost) => (

            <div
              key={cost._id}
              className="bg-white rounded-2xl shadow p-5"
            >

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold">
                  {cost.name}
                </h2>

                <span className="text-sm bg-black text-white px-3 py-1 rounded-full">

                  {cost.type}

                </span>

              </div>

              <p className="text-gray-500 mt-2">
                {cost.description}
              </p>

              <div className="mt-4 space-y-2">

                <p>
                  <span className="font-semibold">
                    Key:
                  </span>{" "}
                  {cost.key}
                </p>

                <p>
                  <span className="font-semibold">
                    Value:
                  </span>{" "}
                  {cost.value}
                </p>

                <p>
                  <span className="font-semibold">
                    Platforms:
                  </span>{" "}
                  {cost.applicableOn.join(
                    ", "
                  )}
                </p>

              </div>

            </div>
          ))}

      </div>

    </div>
  );
}