"use client";

import { useState } from "react";
import generateZPL from "@/lib/generateZPL";
import { printRaw } from "@/lib/qz";

export default function PrintTagsPage() {
  const [tags, setTags] = useState([
    { bid: "", sku: "", netWeight: "" },
    { bid: "", sku: "", netWeight: "" },
    { bid: "", sku: "", netWeight: "" },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...tags];
    updated[index][field] = value;
    setTags(updated);
  };

 const handlePrint = async () => {
  try {
    const zpl = generateZPL(tags);

    console.log(zpl);

    await printRaw(
      zpl,
      "ZDesigner ZD230-203dpi ZPL"
    );

    alert("Printed");
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-8">

        <h1 className="text-3xl font-bold">
          Jewellery Tag Printing
        </h1>

        <p className="text-gray-500 mb-8">
          Print 3 Jewellery Tags in One Row
        </p>

        <div className="grid grid-cols-2 gap-8">

          {/* LEFT */}

          <div>

            {tags.map((tag, index) => (

              <div
                key={index}
                className="border rounded-xl p-5 mb-5"
              >

                <h2 className="font-bold text-lg mb-4">
                  Tag {index + 1}
                </h2>

                <label className="block text-sm mb-2">
                  Net Weight (g)
                </label>

                <input
                  type="number"
                  step="0.001"
                  value={tag.netWeight}
                  onChange={(e) =>
                    handleChange(index, "netWeight", e.target.value)
                  }
                  className="w-full border rounded-lg p-3 mb-4"
                  placeholder="3.550"
                />

                <label className="block text-sm mb-2">
                  SKU ID
                </label>

                <input
                  value={tag.sku}
                  onChange={(e) =>
                    handleChange(index, "sku", e.target.value)
                  }
                  className="w-full border rounded-lg p-3 mb-4"
                  placeholder="SIV-RNG-001"
                />

                <label className="block text-sm mb-2">
                  Bid
                </label>

                <input
                  value={tag.bid}
                  onChange={(e) =>
                    handleChange(index, "bid", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="06072026243075"
                />

              </div>

            ))}

            <button
              onClick={handlePrint}
              className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold"
            >
              Print Tags
            </button>

          </div>

          {/* RIGHT */}

          <div>

            <h2 className="font-bold text-xl mb-4">
              Live Preview
            </h2>

            <div className="flex justify-between">

              {tags.map((tag, i) => (

                <div
                  key={i}
                  className="border w-28 h-[420px] rounded-lg relative bg-white"
                >

                  <div className="absolute top-3 left-2 text-[10px] font-bold rotate-90 origin-left">

                    NW : {tag.netWeight || "0.000"} g

                    <br />

                    SKU : {tag.sku || "-"}

                    <br />

                    Bid : {tag.bid || "-"}

                  </div>

                  <div className="absolute bottom-6 left-3 rotate-90 origin-left text-[10px]">

                    GET Upto 20% Cashback

                    <br />

                    DM Us On Instagram

                  </div>

                  <div className="absolute bottom-24 right-2 rotate-90 font-bold text-lg">

                    SIVAAH.IN

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}