"use client";

import { useEffect, useMemo, useState } from "react";

export default function SalesDashboardPage() {
    /* =====================================================
       DATA
    ===================================================== */

    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sales, setSales] = useState([]);
    const [channels, setChannels] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingSaleId, setDeletingSaleId] = useState(null);
    /* =====================================================
       SALE MODAL
    ===================================================== */

    const [showSaleModal, setShowSaleModal] = useState(false);

    const [saleForm, setSaleForm] = useState({
        saleDate: new Date().toISOString().split("T")[0],
        saleId: "",
        channel: "",
        customer: "",
        productId: "",
        batchId: "",
        quantity: 1,
        sellingPrice: "",
        discount: 0,
        paymentStatus: "Paid",
        paymentMethod: "Cash",
        notes: "",
    });

    const [silverRate, setSilverRate] = useState(0);

    /* =====================================================
       FILTER
    ===================================================== */

    const [period, setPeriod] = useState("all");

    /* =====================================================
       FETCH EVERYTHING
    ===================================================== */

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setLoading(true);

            await Promise.all([
                fetchProducts(),
                fetchBatches(),
                fetchSales(),
                fetchChannels(),
                fetchSilverRate(),
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    /* =====================================================
       PRODUCTS
    ===================================================== */

    async function fetchProducts() {
        try {
            const res = await fetch("/api/products/all");
            const data = await res.json();

            setProducts(data.data || []);
        } catch (error) {
            console.error("PRODUCT ERROR:", error);
        }
    }

    /* =====================================================
       ALL SOURCING BATCHES
       IMPORTANT:
       We are NOT taking batch list from product.batchids.
    ===================================================== */

    async function fetchBatches() {
        try {
            const res = await fetch("/api/sourcing/all");
            const data = await res.json();

            console.log("BATCHES:", data);

            setBatches(data.data || []);
        } catch (error) {
            console.error("BATCH ERROR:", error);
        }
    }

    /* =====================================================
       SALES
    ===================================================== */

    async function fetchSales() {
        try {
            const res = await fetch("/api/sales");
            const data = await res.json();

            setSales(data.data || []);
        } catch (error) {
            console.error("SALES ERROR:", error);
        }
    }

    /* =====================================================
       CHANNELS
    ===================================================== */

    async function fetchChannels() {
        try {
            /*
              Change this endpoint ONLY if your existing
              Sale Channels API has a different route.
            */

            const res = await fetch("/api/sale-channel/all");

            if (!res.ok) {
                setChannels([]);
                return;
            }

            const data = await res.json();

            setChannels(data.data || []);
        } catch (error) {
            console.error("CHANNEL ERROR:", error);

            setChannels([]);
        }
    }

    /* =====================================================
       CURRENT SILVER RATE
    ===================================================== */

    async function fetchSilverRate() {
        try {
            const res = await fetch("/api/metalrates/silver");
            const data = await res.json();

            if (data.success) {
                setSilverRate(data.ratePerGram);
            }
        } catch (error) {
            console.error("SILVER RATE ERROR:", error);
        }
    }

    /* =====================================================
       PRODUCT SELECT
    ===================================================== */
    const matchingProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();

        if (!query) return [];

        return products
            .filter((product) => {
                return (
                    product.name?.toLowerCase().includes(query) ||
                    product.sku_id?.toLowerCase().includes(query) ||
                    product.category?.toLowerCase().includes(query)
                );
            })
            .slice(0, 8);
    }, [products, productSearch]);
    function handleProductChange(productId) {
        const product = products.find(
            (p) => p._id === productId
        );

        setSaleForm((prev) => ({
            ...prev,
            productId,
            batchId: "",
            quantity: 1,
            sellingPrice: product?.price || "",
        }));
    }

    /* =====================================================
       BATCHES AVAILABLE FOR SELECTED PRODUCT
       
       We fetch ALL batches from backend.
       
       Then we show batches which are available for
       this product using product.batchids.
       
       IMPORTANT:
       batchId sent to backend is the actual sourcing
       batchId string.
    ===================================================== */

    const availableBatches = useMemo(() => {
        if (!saleForm.productId) return [];

        const product = products.find(
            (p) => p._id === saleForm.productId
        );

        if (!product) return [];

        const productBatchIds = Array.isArray(product.batchids)
            ? product.batchids
            : [];

        return batches
            .map((batch) => {
                const productBatch = productBatchIds.find(
                    (b) => b.batchid === batch.batchId
                );

                if (!productBatch) return null;

                return {
                    ...batch,
                    productQuantity: Number(
                        productBatch.quantity || 0
                    ),
                };
            })
            .filter(Boolean);
    }, [saleForm.productId, products, batches]);

    /* =====================================================
       SELECT BATCH
    ===================================================== */

    function handleBatchChange(batchId) {
        setSaleForm((prev) => ({
            ...prev,
            batchId,
        }));
    }

    /* =====================================================
       SELECTED PRODUCT
    ===================================================== */

    const selectedProduct = useMemo(() => {
        return products.find(
            (p) => p._id === saleForm.productId
        );
    }, [products, saleForm.productId]);

    /* =====================================================
       SELECTED BATCH
    ===================================================== */

    const selectedBatch = useMemo(() => {
        return availableBatches.find(
            (b) => b.batchId === saleForm.batchId
        );
    }, [availableBatches, saleForm.batchId]);

    /* =====================================================
         DELETR SALE
      ===================================================== */
    async function deleteSale(saleId) {

        const confirmed = window.confirm(
            "Delete this sale?\n\nThe sold quantity will be added back to the original batch and total stock."
        );

        if (!confirmed) return;

        try {

            // Show deleting state immediately
            setDeletingSaleId(saleId);

            const res = await fetch(
                `/api/sales/${saleId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!data.success) {

                alert(
                    data.message ||
                    "Failed to delete sale."
                );

                return;
            }

            alert(
                `Sale deleted successfully.\n\nStock restored: ${data.restored.quantity} units`
            );

            // Refresh sales
            await fetchSales();

            // Also refresh products/batches so stock is updated
            await fetchProducts();
            await fetchBatches();

        } catch (error) {

            console.error(
                "DELETE SALE ERROR:",
                error
            );

            alert(
                "Something went wrong while deleting the sale."
            );

        } finally {

            // Remove deleting state
            setDeletingSaleId(null);
        }
    }
    /* =====================================================
       SUBMIT SALE
    ===================================================== */

    async function submitSale(e) {
        e.preventDefault();

        if (!saleForm.productId) {
            alert("Please select a product.");
            return;
        }

        if (!saleForm.batchId) {
            alert("Please select a batch.");
            return;
        }

        if (!saleForm.channel) {
            alert("Please select a channel.");
            return;
        }

        if (
            !saleForm.quantity ||
            Number(saleForm.quantity) <= 0
        ) {
            alert("Enter valid quantity.");
            return;
        }

        if (
            !saleForm.sellingPrice ||
            Number(saleForm.sellingPrice) < 0
        ) {
            alert("Enter selling price.");
            return;
        }

        if (!silverRate || Number(silverRate) <= 0) {
            alert(
                "Current silver rate could not be fetched."
            );
            return;
        }

        if (
            selectedBatch &&
            Number(saleForm.quantity) >
            Number(selectedBatch.productQuantity)
        ) {
            alert(
                `Only ${selectedBatch.productQuantity} units available in this batch.`
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                saleDate: saleForm.saleDate,

                saleId:
                    saleForm.saleId ||
                    `SAL-${Date.now()}`,

                channel: saleForm.channel,

                customer: saleForm.customer,

                productId: saleForm.productId,

                /*
                  VERY IMPORTANT
                  Send actual sourcing batchId.
                */
                batchId: saleForm.batchId,

                quantity: Number(
                    saleForm.quantity
                ),

                sellingPrice: Number(
                    saleForm.sellingPrice
                ),

                discount: Number(
                    saleForm.discount || 0
                ),

                paymentStatus:
                    saleForm.paymentStatus,

                paymentMethod:
                    saleForm.paymentMethod,

                notes: saleForm.notes,

                /*
                  Existing backend requires this.
                */
                silverRateOnSaleDate:
                    Number(silverRate),
            };

            console.log(
                "SALE PAYLOAD:",
                payload
            );

            const res = await fetch(
                "/api/sales",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            const data = await res.json();

            console.log(
                "SALE RESPONSE:",
                data
            );

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to record sale."
                );
            }

            alert(
                "Sale recorded successfully."
            );

            setShowSaleModal(false);

            setSaleForm({
                saleDate:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                saleId: "",
                channel: "",
                customer: "",
                productId: "",
                batchId: "",
                quantity: 1,
                sellingPrice: "",
                discount: 0,
                paymentStatus: "Paid",
                paymentMethod: "Cash",
                notes: "",
            });

            await loadDashboard();
        } catch (error) {
            console.error(
                "SUBMIT SALE ERROR:",
                error
            );

            alert(error.message);
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       DATE FILTER
    ===================================================== */

    function getDateRange() {

        // ALL SALES
        if (period === "all") {
            return {
                start: new Date(0),
                end: new Date(8640000000000000),
            };
        }

        const now = new Date();

        const start = new Date(now);
        const end = new Date(now);

        if (period === "today") {

            start.setHours(0, 0, 0, 0);

            end.setHours(
                23,
                59,
                59,
                999
            );
        }

        if (period === "yesterday") {

            start.setDate(
                start.getDate() - 1
            );

            start.setHours(
                0,
                0,
                0,
                0
            );

            end.setDate(
                end.getDate() - 1
            );

            end.setHours(
                23,
                59,
                59,
                999
            );
        }

        if (period === "thisMonth") {

            start.setDate(1);

            start.setHours(
                0,
                0,
                0,
                0
            );

            end.setMonth(
                end.getMonth() + 1
            );

            end.setDate(0);

            end.setHours(
                23,
                59,
                59,
                999
            );
        }

        if (period === "lastMonth") {

            start.setMonth(
                start.getMonth() - 1
            );

            start.setDate(1);

            start.setHours(
                0,
                0,
                0,
                0
            );

            end.setDate(1);

            end.setHours(
                0,
                0,
                0,
                0
            );
        }

        if (period === "thisYear") {

            start.setMonth(0, 1);

            start.setHours(
                0,
                0,
                0,
                0
            );

            end.setMonth(11, 31);

            end.setHours(
                23,
                59,
                59,
                999
            );
        }

        return {
            start,
            end,
        };
    }

    /* =====================================================
       FILTERED SALES
    ===================================================== */

    const filteredSales = useMemo(() => {
        const { start, end } =
            getDateRange();

        return sales.filter(
            (sale) => {
                const date = new Date(
                    sale.saleDate
                );

                return (
                    date >= start &&
                    date <= end
                );
            }
        );
    }, [sales, period]);

    /* =====================================================
       KPIs
    ===================================================== */

    const stats = useMemo(() => {
        let revenue = 0;
        let units = 0;
        let cogs = 0;
        let profit = 0;

        filteredSales.forEach(
            (sale) => {
                revenue += Number(
                    sale.netRevenue || 0
                );

                units += Number(
                    sale.quantity || 0
                );

                cogs += Number(
                    sale.costOverall || 0
                );

                profit += Number(
                    sale.profitOverall || 0
                );
            }
        );

        const orders =
            filteredSales.length;

        const margin =
            revenue > 0
                ? (profit / revenue) * 100
                : 0;

        const aov =
            orders > 0
                ? revenue / orders
                : 0;

        return {
            revenue,
            orders,
            units,
            cogs,
            profit,
            margin,
            aov,
        };
    }, [filteredSales]);

    /* =====================================================
       FORMAT
    ===================================================== */

    function money(value) {
        return `₹${Number(
            value || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
        })}`;
    }

    /* =====================================================
       UI
    ===================================================== */

    if (loading) {
        return (
            <div className="p-8">
                Loading Sales Dashboard...
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

            {/* =================================================
          HEADER
      ================================================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>
                    <h1 className="text-3xl font-bold">
                        Sales & Profit
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Track sales, stock and profitability.
                    </p>
                </div>

                <button
                    onClick={() =>
                        setShowSaleModal(true)
                    }
                    className="bg-black text-white px-5 py-3 rounded-xl"
                >
                    + Record Sale
                </button>
            </div>

            {/* =================================================
          FILTER
      ================================================= */}

            <div className="bg-white border rounded-xl p-4 mb-6">

                <div className="flex flex-wrap gap-2">

                    {[
                        ["all", "All Sales"],
                        ["today", "Today"],
                        ["yesterday", "Yesterday"],
                        ["thisMonth", "This Month"],
                        ["lastMonth", "Last Month"],
                        ["thisYear", "This Year"],
                    ].map(
                        ([value, label]) => (
                            <button
                                key={value}
                                onClick={() =>
                                    setPeriod(value)
                                }
                                className={`px-4 py-2 rounded-lg border ${period === value
                                    ? "bg-black text-white"
                                    : "bg-white"
                                    }`}
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* =================================================
          KPI
      ================================================= */}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">

                <KPI
                    title="Revenue"
                    value={money(
                        stats.revenue
                    )}
                />

                <KPI
                    title="Orders"
                    value={stats.orders}
                />

                <KPI
                    title="Units Sold"
                    value={stats.units}
                />

                <KPI
                    title="COGS"
                    value={money(
                        stats.cogs
                    )}
                />

                <KPI
                    title="Gross Profit"
                    value={money(
                        stats.profit
                    )}
                />

                <KPI
                    title="Margin"
                    value={`${stats.margin.toFixed(
                        1
                    )}%`}
                />

                <KPI
                    title="AOV"
                    value={money(
                        stats.aov
                    )}
                />
            </div>

            {/* =================================================
          SALES TABLE
      ================================================= */}

            <div className="bg-white border rounded-2xl overflow-hidden">

                <div className="p-5 border-b">

                    <h2 className="text-xl font-bold">
                        Sales History
                    </h2>

                    <p className="text-sm text-gray-500">
                        {filteredSales.length} sales
                    </p>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50">

                            <tr>
                                <th className="text-left p-4">
                                    Date
                                </th>

                                <th className="text-left p-4">
                                    Sale ID
                                </th>

                                <th className="text-left p-4">
                                    Product
                                </th>

                                <th className="text-left p-4">
                                    SKU
                                </th>

                                <th className="text-left p-4">
                                    Batch
                                </th>

                                <th className="text-left p-4">
                                    Qty
                                </th>

                                <th className="text-left p-4">
                                    Revenue
                                </th>

                                <th className="text-left p-4">
                                    Profit
                                </th>

                                <th className="text-left p-4">
                                    Margin
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {filteredSales.map(
                                (sale) => (
                                    <tr
                                        key={sale._id}
                                        className="border-t"
                                    >

                                        <td className="p-4">
                                            {new Date(
                                                sale.saleDate
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td className="p-4 font-medium">
                                            {sale.saleId}
                                        </td>

                                        <td className="p-4">
                                            {sale.productName}
                                        </td>

                                        <td className="p-4">
                                            {sale.sku}
                                        </td>

                                        <td className="p-4">
                                            {sale.batchId}
                                        </td>

                                        <td className="p-4">
                                            {sale.quantity}
                                        </td>

                                        <td className="p-4">
                                            {money(
                                                sale.netRevenue
                                            )}
                                        </td>

                                        <td className="p-4 font-semibold">
                                            {money(
                                                sale.profitOverall
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {Number(
                                                sale.marginOverall ||
                                                0
                                            ).toFixed(1)}
                                            %
                                        </td>

                                        <td>
                                            <button
                                                onClick={() => deleteSale(sale._id)}
                                                disabled={deletingSaleId === sale._id}
                                                className={`px-3 py-2 rounded-lg text-white ${deletingSaleId === sale._id
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-red-500 hover:bg-red-600"
                                                    }`}
                                            >
                                                {deletingSaleId === sale._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>
                    </table>

                </div>

                {filteredSales.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        No sales recorded for this period.
                    </div>
                )}
            </div>

            {/* =================================================
          RECORD SALE MODAL
      ================================================= */}

            {showSaleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

                        {/* HEADER */}

                        <div className="flex items-center justify-between p-5 border-b">

                            <div>
                                <h2 className="text-xl font-bold">
                                    Record Sale
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Current silver rate:{" "}
                                    <b>
                                        ₹{silverRate}/g
                                    </b>
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowSaleModal(false)
                                }
                                className="text-2xl"
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={submitSale}
                            className="p-5 space-y-5"
                        >

                            {/* DATE */}

                            <div>
                                <label className="label">
                                    Sale Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        saleForm.saleDate
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                saleDate:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                />
                            </div>

                            {/* SALE ID */}

                            <div>
                                <label className="label">
                                    Sale / Order ID
                                </label>

                                <input
                                    type="text"
                                    placeholder="Optional"
                                    value={
                                        saleForm.saleId
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                saleId:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                />
                            </div>

                            {/* CHANNEL */}

                            <div>
                                <label className="label">
                                    Channel *
                                </label>

                                <select
                                    value={
                                        saleForm.channel
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                channel:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                    required
                                >

                                    <option value="">
                                        Select Channel
                                    </option>

                                    {channels.map(
                                        (channel) => (
                                            <option
                                                key={
                                                    channel._id ||
                                                    channel.id ||
                                                    channel.name
                                                }
                                                value={
                                                    channel.name ||
                                                    channel.channel
                                                }
                                            >
                                                {channel.name ||
                                                    channel.channel}
                                            </option>
                                        )
                                    )}

                                    {/* FALLBACK */}

                                    {channels.length ===
                                        0 && (
                                            <>
                                                <option>
                                                    Website
                                                </option>

                                                <option>
                                                    Instagram
                                                </option>

                                                <option>
                                                    Offline
                                                </option>

                                                <option>
                                                    Retailer
                                                </option>
                                            </>
                                        )}

                                </select>
                            </div>

                            {/* CUSTOMER */}

                            <div>
                                <label className="label">
                                    Customer / Retailer
                                </label>

                                <input
                                    type="text"
                                    value={
                                        saleForm.customer
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                customer:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                />
                            </div>

                            {/* PRODUCT */}
                            {/* PRODUCT SEARCH */}

                            <div className="relative">

                                <label className="label">
                                    Product *
                                </label>

                                {!saleForm.productId ? (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Search product name or SKU..."
                                            value={productSearch}
                                            onChange={(e) =>
                                                setProductSearch(e.target.value)
                                            }
                                            className="input"
                                            autoComplete="off"
                                        />

                                        {/* MATCHING PRODUCTS */}

                                        {productSearch.trim() &&
                                            matchingProducts.length > 0 && (
                                                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-64 overflow-y-auto">

                                                    {matchingProducts.map((product) => (
                                                        <button
                                                            key={product._id}
                                                            type="button"
                                                            onClick={() => {
                                                                handleProductChange(product._id);
                                                                setProductSearch("");
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                                                        >

                                                            <div className="font-semibold">
                                                                {product.name}
                                                            </div>

                                                            <div className="text-xs text-gray-500 mt-1">
                                                                SKU: {product.sku_id}
                                                                {" • "}
                                                                {product.category}
                                                                {" • "}
                                                                Stock: {product.stock || 0}
                                                            </div>

                                                        </button>
                                                    ))}

                                                </div>
                                            )}

                                        {productSearch.trim() &&
                                            matchingProducts.length === 0 && (
                                                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg p-4 text-sm text-gray-500">
                                                    No matching products found.
                                                </div>
                                            )}
                                    </>
                                ) : (
                                    /* SELECTED PRODUCT */

                                    <div className="border rounded-xl p-3 bg-gray-50">

                                        <div className="flex items-center justify-between gap-3">

                                            <div className="min-w-0">

                                                <p className="font-semibold truncate">
                                                    {selectedProduct?.name}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    SKU: {selectedProduct?.sku_id}
                                                    {" • "}
                                                    Stock: {selectedProduct?.stock || 0}
                                                </p>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSaleForm((prev) => ({
                                                        ...prev,
                                                        productId: "",
                                                        batchId: "",
                                                        quantity: 1,
                                                        sellingPrice: "",
                                                    }));

                                                    setProductSearch("");
                                                }}
                                                className="text-sm text-red-600 font-medium whitespace-nowrap"
                                            >
                                                Change
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>

                            {/* BATCH */}

                            <div>
                                <label className="label">
                                    Batch *
                                </label>

                                <select
                                    value={
                                        saleForm.batchId
                                    }
                                    onChange={(e) =>
                                        handleBatchChange(
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                    required
                                    disabled={
                                        !saleForm.productId
                                    }
                                >

                                    <option value="">
                                        {!saleForm.productId
                                            ? "Select product first"
                                            : availableBatches.length ===
                                                0
                                                ? "No batches available"
                                                : "Select Batch"}
                                    </option>

                                    {availableBatches.map(
                                        (batch) => (
                                            <option
                                                key={
                                                    batch.batchId
                                                }
                                                value={
                                                    batch.batchId
                                                }
                                            >
                                                {batch.batchId}{" "}
                                                — Silver ₹
                                                {
                                                    batch.silverRate
                                                }{" "}
                                                — Labour ₹
                                                {
                                                    batch.labourPerGram
                                                }{" "}
                                                — Qty{" "}
                                                {
                                                    batch.productQuantity
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                                {saleForm.productId &&
                                    availableBatches.length ===
                                    0 && (
                                        <p className="text-red-500 text-sm mt-2">
                                            No batch for this
                                            product is available.
                                        </p>
                                    )}
                            </div>

                            {/* QUANTITY */}

                            <div>
                                <label className="label">
                                    Quantity *
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        saleForm.quantity
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                quantity:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                    required
                                />

                                {selectedBatch && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Available in batch:{" "}
                                        {
                                            selectedBatch.productQuantity
                                        }
                                    </p>
                                )}
                            </div>

                            {/* SELLING PRICE */}

                            <div>
                                <label className="label">
                                    Selling Price / Unit *
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        saleForm.sellingPrice
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                sellingPrice:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                    required
                                />
                            </div>

                            {/* DISCOUNT */}

                            <div>
                                <label className="label">
                                    Discount
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        saleForm.discount
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                discount:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                />
                            </div>

                            {/* PAYMENT STATUS */}

                            <div>
                                <label className="label">
                                    Payment Status
                                </label>

                                <select
                                    value={
                                        saleForm.paymentStatus
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                paymentStatus:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                >
                                    <option>
                                        Paid
                                    </option>

                                    <option>
                                        Pending
                                    </option>

                                    <option>
                                        Partial
                                    </option>
                                </select>
                            </div>

                            {/* PAYMENT METHOD */}

                            <div>
                                <label className="label">
                                    Payment Method
                                </label>

                                <select
                                    value={
                                        saleForm.paymentMethod
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                paymentMethod:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                >
                                    <option>
                                        Cash
                                    </option>

                                    <option>
                                        UPI
                                    </option>

                                    <option>
                                        Card
                                    </option>

                                    <option>
                                        Bank Transfer
                                    </option>

                                    <option>
                                        Razorpay
                                    </option>
                                </select>
                            </div>

                            {/* NOTES */}

                            <div>
                                <label className="label">
                                    Notes
                                </label>

                                <textarea
                                    value={
                                        saleForm.notes
                                    }
                                    onChange={(e) =>
                                        setSaleForm(
                                            (prev) => ({
                                                ...prev,
                                                notes:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="input"
                                    rows="3"
                                />
                            </div>

                            {/* SUMMARY */}
                            {/* =================================================
    SALE PREVIEW
================================================= */}

                            {selectedProduct && selectedBatch && (
                                <SalePreview
                                    product={selectedProduct}
                                    batch={selectedBatch}
                                    quantity={Number(saleForm.quantity || 0)}
                                    sellingPrice={Number(
                                        saleForm.sellingPrice || 0
                                    )}
                                    discount={Number(
                                        saleForm.discount || 0
                                    )}
                                    silverRate={Number(
                                        silverRate || 0
                                    )}
                                />
                            )}
                            {selectedProduct &&
                                selectedBatch && (
                                    <div className="bg-gray-50 border rounded-xl p-4 space-y-2">

                                        <div className="flex justify-between">
                                            <span>
                                                Product
                                            </span>

                                            <b>
                                                {
                                                    selectedProduct.name
                                                }
                                            </b>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>
                                                Batch
                                            </span>

                                            <b>
                                                {
                                                    selectedBatch.batchId
                                                }
                                            </b>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>
                                                Silver Purchase Rate
                                            </span>

                                            <b>
                                                ₹
                                                {
                                                    selectedBatch.silverRate
                                                }
                                                /g
                                            </b>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>
                                                Labour
                                            </span>

                                            <b>
                                                ₹
                                                {
                                                    selectedBatch.labourPerGram
                                                }
                                                /g
                                            </b>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>
                                                Weight
                                            </span>

                                            <b>
                                                {
                                                    selectedProduct.grams
                                                }
                                                g
                                            </b>
                                        </div>

                                    </div>
                                )}

                            {/* BUTTONS */}

                            <div className="flex gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowSaleModal(
                                            false
                                        )
                                    }
                                    className="w-full border px-4 py-3 rounded-xl"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="w-full bg-black text-white px-4 py-3 rounded-xl"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Recording..."
                                        : "Record Sale"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
          SMALL CSS
      ================================================= */}

            <style jsx>{`
        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 11px 12px;
          background: white;
        }

        .input:focus {
          outline: none;
          border-color: #111827;
        }
      `}</style>

        </div>
    );
}

/* =====================================================
   KPI COMPONENT
===================================================== */

function KPI({
    title,
    value,
}) {
    return (
        <div className="bg-white border rounded-xl p-4">

            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className="text-xl font-bold mt-1">
                {value}
            </p>

        </div>
    );
}
function SalePreview({
    product,
    batch,
    quantity,
    sellingPrice,
    discount,
    silverRate,
}) {
    const weight = Number(
        product?.grams || 0
    );

    const labourCost = Number(
        batch?.labourPerGram || 0
    );

    const silverPriceWhenBought =
        Number(
            batch?.silverRate || 0
        );

    /*
      =========================
      REVENUE
      =========================
    */

    const grossSellingValue =
        sellingPrice * quantity;

    const netRevenue =
        grossSellingValue - discount;

    /*
      =========================
      COST AT THAT DAY
      =========================
  
      (Today's Silver Rate + Labour)
      × Weight
      × Quantity
    */

    const costAtThatDay =
        (
            silverRate +
            labourCost
        ) *
        weight *
        quantity;

    /*
      =========================
      COST OVERALL
      =========================
  
      (Purchase Silver Rate + Labour)
      × Weight
      × Quantity
    */

    const costOverall =
        (
            silverPriceWhenBought +
            labourCost
        ) *
        weight *
        quantity;

    /*
      =========================
      PROFIT AT THAT DAY
      =========================
    */

    const profitAtThatDay =
        netRevenue -
        costAtThatDay;

    const marginAtThatDay =
        netRevenue > 0
            ? (
                profitAtThatDay /
                netRevenue
            ) * 100
            : 0;

    /*
      =========================
      PROFIT OVERALL
      =========================
    */

    const profitOverall =
        netRevenue -
        costOverall;

    const marginOverall =
        netRevenue > 0
            ? (
                profitOverall /
                netRevenue
            ) * 100
            : 0;

    function money(value) {
        return `₹${Number(
            value || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`;
    }

    return (
        <div className="border rounded-2xl bg-gray-50 overflow-hidden">

            {/* HEADER */}

            <div className="px-4 py-3 border-b bg-gray-100">

                <h3 className="font-bold">
                    Sale Preview
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                    Profit is calculated using the
                    selected batch.
                </p>

            </div>

            <div className="p-4 space-y-3">

                {/* PRODUCT */}

                <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                        Product
                    </span>

                    <span className="font-medium text-right">
                        {product?.name}
                    </span>
                </div>

                {/* BATCH */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Batch
                    </span>

                    <span className="font-semibold">
                        {batch?.batchId}
                    </span>
                </div>

                {/* WEIGHT */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Weight / Unit
                    </span>

                    <span>
                        {weight} g
                    </span>
                </div>

                {/* QUANTITY */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Quantity
                    </span>

                    <span>
                        {quantity}
                    </span>
                </div>

                <div className="border-t my-3" />

                {/* SELLING VALUE */}

                <div className="flex justify-between">
                    <span>
                        Selling Value
                    </span>

                    <span className="font-medium">
                        {money(
                            grossSellingValue
                        )}
                    </span>
                </div>

                {/* DISCOUNT */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Discount
                    </span>

                    <span className="text-red-600">
                        - {money(discount)}
                    </span>
                </div>

                {/* NET REVENUE */}

                <div className="flex justify-between font-bold">
                    <span>
                        Net Revenue
                    </span>

                    <span>
                        {money(netRevenue)}
                    </span>
                </div>

                <div className="border-t my-3" />

                {/* SILVER RATE TODAY */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Silver Rate Today
                    </span>

                    <span>
                        ₹{silverRate}/g
                    </span>
                </div>

                {/* PURCHASE SILVER */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Silver Price When Bought
                    </span>

                    <span>
                        ₹{silverPriceWhenBought}/g
                    </span>
                </div>

                {/* LABOUR */}

                <div className="flex justify-between">
                    <span className="text-gray-600">
                        Labour Cost
                    </span>

                    <span>
                        ₹{labourCost}/g
                    </span>
                </div>

                <div className="border-t my-3" />

                {/* COST TODAY */}

                <div className="flex justify-between">
                    <span>
                        Cost At That Day
                    </span>

                    <span>
                        {money(
                            costAtThatDay
                        )}
                    </span>
                </div>

                {/* PROFIT TODAY */}

                <div className="flex justify-between bg-white rounded-lg p-3">

                    <div>
                        <p className="font-semibold">
                            Profit At That Day
                        </p>

                        <p className="text-xs text-gray-500">
                            Based on today's silver rate
                        </p>
                    </div>

                    <div className="text-right">

                        <p
                            className={`font-bold ${profitAtThatDay >= 0
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {money(
                                profitAtThatDay
                            )}
                        </p>

                        <p className="text-xs">
                            Margin{" "}
                            {marginAtThatDay.toFixed(
                                2
                            )}
                            %
                        </p>

                    </div>

                </div>

                {/* COST OVERALL */}

                <div className="flex justify-between">
                    <span>
                        Cost Overall
                    </span>

                    <span>
                        {money(
                            costOverall
                        )}
                    </span>
                </div>

                {/* PROFIT OVERALL */}

                <div className="flex justify-between bg-black text-white rounded-lg p-3">

                    <div>
                        <p className="font-semibold">
                            Profit Overall
                        </p>

                        <p className="text-xs text-gray-300">
                            Based on actual purchase cost
                        </p>
                    </div>

                    <div className="text-right">

                        <p
                            className={`font-bold ${profitOverall >= 0
                                ? "text-green-400"
                                : "text-red-400"
                                }`}
                        >
                            {money(
                                profitOverall
                            )}
                        </p>

                        <p className="text-xs text-gray-300">
                            Margin{" "}
                            {marginOverall.toFixed(
                                2
                            )}
                            %
                        </p>

                    </div>

                </div>

            </div>
        </div>
    );
}