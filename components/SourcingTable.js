"use client";

import { useState } from "react";

export default function SourcingTable({
    sourcings = [],
}) {

    const [expandedBatch, setExpandedBatch] =
        useState(null);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const fetchProducts = async (
        batchid
    ) => {

        try {

            setLoading(true);

            const res = await fetch(
                `/api/sourcing/products/${batchid}`
            );

            const data = await res.json();

            if (data.success) {

                setProducts(
                    Array.isArray(data.data)
                        ? data.data
                        : []
                );

            } else {

                setProducts([]);

            }

        } catch (error) {

            console.log(error);

            setProducts([]);

        } finally {

            setLoading(false);

        }
    };

    const handleExpand = async (
        batchid
    ) => {

        if (expandedBatch === batchid) {

            setExpandedBatch(null);

            return;
        }

        setExpandedBatch(batchid);

        await fetchProducts(batchid);
    };

    return (
        <div className="overflow-x-auto">

            <table className="w-full border">

                <thead className="bg-black text-white">

                    <tr>

                        <th className="p-3">
                            Batch ID
                        </th>

                        <th className="p-3">
                            Date
                        </th>

                        <th className="p-3">
                            Qty(g)
                        </th>

                        <th className="p-3">
                            Silver Rate
                        </th>

                        <th className="p-3">
                            Labour/g
                        </th>

                        <th className="p-3">
                            Total Cost
                        </th>

                        <th className="p-3">
                            Remaining
                        </th>

                        <th className="p-3">
                            Vendor
                        </th>

                        <th className="p-3">
                            Products
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {Array.isArray(sourcings) &&
                        sourcings.length > 0 ? (

                        sourcings.map((item) => (

                            <FragmentWrapper
                                key={item._id}
                            >

                                <tr className="border-b text-center">

                                    <td className="p-3">
                                        {item.batchId}
                                    </td>

                                    <td className="p-3">
                                        {new Date(
                                            item.date
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="p-3">
                                        {item.quantityInGram}
                                    </td>

                                    <td className="p-3">
                                        ₹{item.silverRate}
                                    </td>

                                    <td className="p-3">
                                        ₹{item.labourPerGram}
                                    </td>

                                    <td className="p-3">
                                        ₹{item.totalCost}
                                    </td>

                                    <td className="p-3">
                                        {item.remainingQty}g
                                    </td>

                                    <td className="p-3">
                                        {item.vendor}
                                    </td>

                                    <td className="p-3">

                                        <button
                                            onClick={() =>
                                                handleExpand(
                                                    item.batchId
                                                )
                                            }
                                            className="bg-black text-white px-4 py-2 rounded"
                                        >
                                            {expandedBatch ===
                                                item.batchId
                                                ? "Hide"
                                                : "View"}
                                        </button>

                                    </td>

                                </tr>

                                {expandedBatch ===
                                    item.batchId && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="p-5 bg-gray-100"
                                            >

                                                {loading ? (

                                                    <p>
                                                        Loading...
                                                    </p>

                                                ) : (

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                                        {Array.isArray(
                                                            products
                                                        ) &&
                                                            products.length >
                                                            0 ? (

                                                            products.map(
                                                                (
                                                                    product
                                                                ) => (

                                                                    <div
                                                                        key={product._id}
                                                                        className="
    group
    bg-white
    rounded-3xl
    overflow-hidden
    border
    border-gray-200
    hover:border-black
    transition-all
    duration-300
    hover:shadow-2xl
    hover:-translate-y-1
  "
                                                                    >

                                                                        {/* IMAGE */}

                                                                        <div className="relative overflow-hidden">

                                                                            <img
                                                                                src={product?.images?.[0] || ""}
                                                                                alt={product.name}
                                                                                className="
        w-full
        h-64
        object-cover
        transition-transform
        duration-500
        group-hover:scale-105
      "
                                                                            />

                                                                            {/* STOCK BADGE */}

                                                                            <div className="
      absolute
      top-3
      right-3
      bg-black
      text-white
      text-xs
      px-3
      py-1
      rounded-full
      font-medium
    ">
                                                                                {product.stock} Left
                                                                            </div>

                                                                        </div>

                                                                        {/* CONTENT */}

                                                                        <div className="p-5">

                                                                            {/* CATEGORY */}

                                                                            <p className="
      text-xs
      uppercase
      tracking-widest
      text-gray-400
      font-medium
    ">
                                                                                {product.category}
                                                                            </p>

                                                                            {/* NAME */}

                                                                            <h2 className="
      mt-2
      font-semibold
      text-lg
      leading-snug
      line-clamp-2
      min-h-[56px]
    ">
                                                                                {product.name}
                                                                            </h2>

                                                                            {/* PRICE */}

                                                                            <div className="
      flex
      items-center
      justify-between
      mt-4
    ">

                                                                                <div>

                                                                                    <p className="
          text-2xl
          font-bold
          text-black
        ">
                                                                                        ₹{product.price}
                                                                                    </p>

                                                                                    <p className="
          text-sm
          text-gray-400
          line-through
        ">
                                                                                        ₹{product.mrp}
                                                                                    </p>

                                                                                </div>

                                                                                <div className="
        bg-gray-100
        px-3
        py-1
        rounded-full
        text-sm
        font-medium
      ">
                                                                                    {product.grams}g
                                                                                </div>

                                                                            </div>

                                                                            {/* METRICS */}

                                                                            <div className="
      grid
      grid-cols-2
      gap-3
      mt-5
    ">

                                                                                <div className="
        bg-gray-50
        rounded-2xl
        p-3
      ">

                                                                                    <p className="
          text-xs
          text-gray-400
        ">
                                                                                        Labour/g
                                                                                    </p>

                                                                                    <p className="
          font-semibold
          mt-1
        ">
                                                                                        ₹{product.labourPerGram}
                                                                                    </p>

                                                                                </div>

                                                                                <div className="
        bg-gray-50
        rounded-2xl
        p-3
      ">

                                                                                    <p className="
          text-xs
          text-gray-400
        ">
                                                                                        SKU Stock
                                                                                    </p>

                                                                                    <p className="
          font-semibold
          mt-1
        ">
                                                                                        {product.stock}
                                                                                    </p>

                                                                                </div>

                                                                            </div>

                                                                            {/* BOTTOM ACTION */}

                                                                            <button
                                                                                className="
        w-full
        mt-5
        bg-black
        text-white
        py-3
        rounded-2xl
        font-medium
        hover:bg-gray-900
        transition
      "
                                                                            >
                                                                                View Unit Economics
                                                                            </button>

                                                                        </div>

                                                                    </div>
                                                                )
                                                            )

                                                        ) : (

                                                            <p>
                                                                No products found
                                                            </p>

                                                        )}

                                                    </div>
                                                )}

                                            </td>

                                        </tr>
                                    )}

                            </FragmentWrapper>
                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan="9"
                                className="text-center p-10"
                            >
                                No Sourcings Found
                            </td>

                        </tr>
                    )}

                </tbody>

            </table>

        </div>
    );
}

function FragmentWrapper({
    children,
}) {
    return <>{children}</>;
}