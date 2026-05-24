"use client";

import {
    useEffect,
    useState,
} from "react";

export default function Page() {

    const [channels, setChannels] =
        useState([]);

    const [selectedChannel,
        setSelectedChannel] =
        useState("");

    const [products, setProducts] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(false);

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

                    const finalChannels =
                        Array.isArray(
                            data.data
                        )
                            ? data.data
                            : [];

                    setChannels(
                        finalChannels
                    );

                    if (
                        finalChannels.length >
                        0
                    ) {

                        setSelectedChannel(
                            finalChannels[0].key
                        );
                    }
                }

            } catch (error) {

                console.log(error);

            }
        };

    // FETCH PRODUCTS

    const fetchProducts =
        async (channel) => {

            try {

                setLoading(true);

                const res = await fetch(
                    `/api/cost-price/${channel}`
                );

                const data =
                    await res.json();

                if (data.success) {

                    setProducts(
                        Array.isArray(
                            data.data
                        )
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

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {

        if (selectedChannel) {

            fetchProducts(
                selectedChannel
            );
        }

    }, [selectedChannel]);

    // SEARCH FILTER

    const filteredProducts =
        products.filter((product) => {

            const searchTerm =
                search.toLowerCase();

            return (
                product.name
                    ?.toLowerCase()
                    .includes(searchTerm) ||

                product.category
                    ?.toLowerCase()
                    .includes(searchTerm) ||

                product.slug
                    ?.toLowerCase()
                    .includes(searchTerm) ||

                product.batchid
                    ?.toLowerCase()
                    .includes(searchTerm)
            );
        });

    return (
        <div className="max-w-7xl mx-auto p-8">

            {/* HEADER */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                <div>

                    <h1 className="text-3xl font-bold">
                        Cost Price Dashboard
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Dynamic channel-wise
                        aggregated cost price
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                        Showing {
                            filteredProducts.length
                        } products
                    </p>

                </div>

                {/* RIGHT CONTROLS */}

                <div className="flex flex-col md:flex-row gap-4">

                    {/* CHANNEL SELECT */}

                    <select
                        value={selectedChannel}
                        onChange={(e) =>
                            setSelectedChannel(
                                e.target.value
                            )
                        }
                        className="border p-3 rounded-xl bg-white min-w-[220px]"
                    >

                        {channels.map(
                            (channel) => (

                                <option
                                    key={channel._id}
                                    value={channel.key}
                                >
                                    {channel.name}
                                </option>
                            )
                        )}

                    </select>

                    {/* SEARCH */}

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="border p-3 rounded-xl bg-white min-w-[280px]"
                    />

                </div>

            </div>

            {/* LOADING */}

            {loading ? (

                <div className="text-center py-20">
                    Loading Products...
                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredProducts.map(
                        (product) => (

                            <div
                                key={product._id}
                                className="bg-white rounded-2xl shadow overflow-hidden"
                            >

                                {/* IMAGE */}

                                <img
                                    src={
                                        product
                                            ?.images?.[0] ||
                                        ""
                                    }
                                    alt={
                                        product.name
                                    }
                                    className="w-full h-64 object-cover"
                                />

                                {/* BODY */}

                                <div className="p-5">

                                    <h2 className="text-xl font-bold leading-tight">

                                        {product.name}

                                    </h2>

                                    <p className="text-gray-500 mt-1">

                                        {
                                            product.category
                                        }

                                    </p>

                                    {/* PRODUCT INFO */}

                                    <div className="mt-5 space-y-2 text-sm">

                                        <div className="flex justify-between">

                                            <span>
                                                Weight
                                            </span>

                                            <span className="font-semibold">

                                                {
                                                    product.grams
                                                }g

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span>
                                                Current Silver
                                            </span>

                                            <span className="font-semibold">

                                                ₹
                                                {
                                                    product.currentSilverRate
                                                }
                                                /g

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span>
                                                Sourced Labour
                                            </span>

                                            <span className="font-semibold">

                                                ₹
                                                {
                                                    product.sourcedLabour
                                                }
                                                /g

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span>
                                                Website Price
                                            </span>

                                            <span className="font-semibold">

                                                ₹
                                                {
                                                    product.price
                                                }

                                            </span>

                                        </div>

                                    </div>

                                    {/* RAW VALUE */}

                                    <div className="mt-6 bg-gray-100 rounded-xl p-4">

                                        <div className="flex justify-between">

                                            <span className="font-medium">

                                                Product Raw Value

                                            </span>

                                            <span className="font-bold">

                                                ₹
                                                {Math.round(
                                                    product.rawValue
                                                )}

                                            </span>

                                        </div>

                                    </div>
                                    <div className="mt-4 bg-blue-50 rounded-xl p-4">

                                        <div className="flex justify-between">

                                            <span className="font-medium">
                                                Base Cost
                                            </span>

                                            <span className="font-bold">

                                                ₹
                                                {Math.round(
                                                    product.baseCost
                                                )}

                                            </span>

                                        </div>

                                    </div>
                                    {/* APPLIED COSTS */}

                                    <div className="mt-6">

                                        <h3 className="font-bold mb-3">

                                            Applied Costs

                                        </h3>

                                        <div className="space-y-2">

                                            {Array.isArray(
                                                product.appliedCosts
                                            ) &&
                                                product.appliedCosts.map(
                                                    (
                                                        cost,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={index}
                                                            className="flex justify-between text-sm"
                                                        >

                                                            <span>
                                                                {
                                                                    cost.name
                                                                }
                                                            </span>

                                                            <span>

                                                                ₹
                                                                {Math.round(
                                                                    cost.amount
                                                                )}

                                                            </span>

                                                        </div>
                                                    )
                                                )}

                                        </div>

                                    </div>

                                    {/* FINAL */}

                                    <div className="mt-6 border-t pt-5 space-y-4">

                                        <div className="flex justify-between">

                                            <span className="font-semibold">
                                                Base Cost
                                            </span>

                                            <span>

                                                ₹
                                                {Math.round(
                                                    product.baseCost
                                                )}

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span className="font-semibold">
                                                Universal SP
                                            </span>

                                            <span className="text-xl font-bold">

                                                ₹
                                                {Math.round(
                                                    product.universalSellingPrice
                                                )}

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span>
                                                Customer Pays
                                            </span>

                                            <span>

                                                ₹
                                                {Math.round(
                                                    product.customerPays
                                                )}

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span>
                                                Settlement
                                            </span>

                                            <span>

                                                ₹
                                                {Math.round(
                                                    product.settlement
                                                )}

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span className="font-semibold">
                                                Net Profit
                                            </span>

                                            <span className="text-green-600 font-bold">

                                                ₹
                                                {Math.round(
                                                    product.netProfit
                                                )}

                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span className="font-semibold">
                                                Net Margin
                                            </span>

                                            <span className="font-bold">

                                                {
                                                    product.netMargin
                                                }
                                                %

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        )
                    )}

                </div>
            )}

        </div>
    );
}