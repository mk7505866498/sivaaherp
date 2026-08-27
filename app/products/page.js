"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
  useMemo,
} from "react";

export default function ProductsPage() {
  const [batches, setBatches] = useState([]);
  const [stockModal, setStockModal] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [addingStock, setAddingStock] = useState(false);
  function openStockModal(product) {
    setStockModal(product);
    setSelectedBatch("");
    setQuantity("");
  }

  function closeStockModal() {
    if (addingStock) return;

    setStockModal(null);
    setSelectedBatch("");
    setQuantity("");
  }
 async function fetchBatches() {
  try {
    const res = await fetch("/api/sourcing/all");

    const data = await res.json();

    console.log("========== BATCH API ==========");
    console.log(data);
    console.log("BATCH DATA:", data.data);
    console.log("FIRST BATCH:", data.data?.[0]);
    console.log("===============================");

    setBatches(data.data || []);
  } catch (err) {
    console.log("Batch fetch error:", err);
  }
}
  async function addStock() {
    if (!stockModal) return;

    if (!selectedBatch) {
      alert("Please select a batch.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      setAddingStock(true);

      const res = await fetch(
        "/api/products/add-stock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: stockModal._id,
            batchid: selectedBatch,
            quantity: Number(quantity),
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to update stock"
        );
      }

      alert("Stock updated successfully.");

      closeStockModal();

      fetchProducts();

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setAddingStock(false);
    }
  }
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    fetchProducts();
    fetchBatches();
  }, []);

  async function fetchProducts() {

    const res =
      await fetch(
        "/api/products/all"
      );

    const data =
      await res.json();

    setProducts(
      data.data || []
    );
  }

  async function deleteProduct(id) {

    const confirmDelete =
      confirm(
        "Delete Product?"
      );

    if (!confirmDelete)
      return;

    await fetch(
      `/api/products/delete/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchProducts();
  }
  async function openCertificate(
    productId
  ) {

    try {

      const res =
        await fetch(

          "/api/certificates/generate",

          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                productId,
              }),
          }
        );

      const data =
        await res.json();

      if (!data.success) {

        throw new Error();
      }

      window.open(

        `https://www.sivaah.in/verify/${data.slug}`,

        "_blank"
      );

    } catch (error) {

      console.log(error);

      alert(
        "Error opening certificate"
      );
    }
  }
  const filteredProducts =
    useMemo(() => {

      return products.filter(
        (product) => {

          const query =
            search.toLowerCase();

          return (

            product.name
              ?.toLowerCase()
              .includes(query)

            ||

            product.category
              ?.toLowerCase()
              .includes(query)

            ||

            product.batchid
              ?.toLowerCase()
              .includes(query)

            ||

            product.slug
              ?.toLowerCase()
              .includes(query)
          );
        }
      );

    }, [products, search]);

  return (

    <div className="p-4 md:p-6">

      {/* TOP BAR */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-3xl font-bold">

            Products

          </h1>

          <p className="text-gray-500 mt-1">

            Showing {
              filteredProducts.length
            } products

          </p>

        </div>

        <Link
          href="/products/add"
          className="bg-black text-white px-5 py-3 rounded-xl text-center"
        >
          Add Product
        </Link>

      </div>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search by name, category, batch id, slug..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="w-full border rounded-xl p-4 mb-8"
      />

      {/* PRODUCTS GRID */}

      {/* =====================================================
    PRODUCTS LIST
===================================================== */}

<div className="w-full space-y-3">

  {filteredProducts.map((product) => {

    const firstBatch =
      product.batchids?.[0];

    return (
      <div
        key={product._id}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
      >

        <div className="flex items-center gap-4">

          {/* =========================
              THUMBNAIL
          ========================= */}

          <div className="w-20 h-20 flex-shrink-0">

            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                No Image
              </div>
            )}

          </div>


          {/* =========================
              PRODUCT
          ========================= */}

          <div className="w-[300px] min-w-[250px]">

            <h2 className="font-bold text-base leading-5">
              {product.name}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {product.category}
            </p>

            <p className="text-xs font-medium text-gray-600 mt-1">
              SKU: {product.sku_id}
            </p>

          </div>


          {/* =========================
              PRICE
          ========================= */}

          <div className="w-[100px] flex-shrink-0">

            <p className="text-xs text-gray-400">
              PRICE
            </p>

            <p className="font-semibold">
              ₹{product.price}
            </p>

          </div>


          {/* =========================
              WEIGHT
          ========================= */}

          <div className="w-[80px] flex-shrink-0">

            <p className="text-xs text-gray-400">
              WEIGHT
            </p>

            <p className="font-semibold">
              {product.grams}g
            </p>

          </div>


          {/* =========================
              STOCK
          ========================= */}

          <div className="w-[80px] flex-shrink-0">

            <p className="text-xs text-gray-400">
              STOCK
            </p>

            <p
              className={`font-bold ${
                Number(product.stock || 0) <= 0
                  ? "text-red-600"
                  : Number(product.stock || 0) <= 3
                  ? "text-orange-500"
                  : "text-green-600"
              }`}
            >
              {product.stock || 0}
            </p>

          </div>


          {/* =========================
              BATCH
          ========================= */}

          <div className="w-[180px] flex-shrink-0">

            <p className="text-xs text-gray-400">
              BATCH
            </p>

            <p className="text-xs font-semibold break-all">
              {firstBatch?.batchid || "—"}
            </p>

            {firstBatch && (
              <p className="text-xs text-gray-500">
                Qty: {firstBatch.quantity || 0}
              </p>
            )}

          </div>


          {/* =========================
              ACTIONS
          ========================= */}

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">

            {/* EDIT */}

            <Link
              href={`/products/edit/${product._id}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              Edit
            </Link>


            {/* DELETE */}

            <button
              onClick={() =>
                deleteProduct(product._id)
              }
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              Delete
            </button>


            {/* CERTIFICATE */}

            <button
              onClick={() =>
                openCertificate(product._id)
              }
              className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              Certificate
            </button>


            {/* UPDATE STOCK */}

            <button
              onClick={() =>
                openStockModal(product)
              }
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
            >
              + Stock
            </button>

          </div>

        </div>

      </div>
    );

  })}

</div>

      {/* EMPTY */}

      {filteredProducts.length === 0 && (

        <div className="text-center py-20 text-gray-500">

          No Products Found

        </div>
      )}
      {/* =========================
    UPDATE STOCK POPUP
========================= */}

      {stockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

            {/* HEADER */}

            <div className="flex justify-between items-start mb-6">

              <div>
                <h2 className="text-xl font-bold">
                  Update Stock
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {stockModal.name}
                </p>
              </div>

              <button
                onClick={closeStockModal}
                className="text-gray-500 text-2xl"
              >
                ×
              </button>

            </div>


            {/* CURRENT STOCK */}

            <div className="bg-gray-50 rounded-xl p-4 mb-5">

              <div className="flex justify-between">

                <span className="text-gray-500">
                  Current Stock
                </span>

                <span className="font-bold">
                  {stockModal.stock || 0}
                </span>

              </div>

            </div>


            {/* SELECT BATCH */}

            <div className="mb-5">

              <label className="block text-sm font-semibold mb-2">
                Select Batch
              </label>

              {batches.length > 0 ? (

                <select
                  value={selectedBatch}
                  onChange={(e) =>
                    setSelectedBatch(e.target.value)
                  }
                  className="w-full border rounded-xl p-3 bg-white"
                >

                  <option value="">
                    Select a batch
                  </option>

                  {batches.map((batch) => (

                    <option
                      key={batch._id || batch.batchId}
                      value={batch.batchId}
                    >
                      {batch.batchId}
                    </option>

                  ))}

                </select>

              ) : (

                <div className="border rounded-xl p-3 text-sm text-gray-500">
                  No batches available.
                </div>

              )}

            </div>


            {/* QUANTITY */}

            <div className="mb-6">

              <label className="block text-sm font-semibold mb-2">
                Quantity to Add
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Enter quantity"
                className="w-full border rounded-xl p-3"
              />

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                onClick={closeStockModal}
                disabled={addingStock}
                className="w-full border rounded-xl py-3"
              >
                Cancel
              </button>

              <button
                onClick={addStock}
                disabled={
                  addingStock ||
                  !selectedBatch ||
                  !quantity
                }
                className="w-full bg-black text-white rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {addingStock
                  ? "Updating..."
                  : "Add Stock"}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}