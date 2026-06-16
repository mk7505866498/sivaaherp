"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
  useMemo,
} from "react";

export default function ProductsPage() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    fetchProducts();
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

    <div className="p-8">

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {filteredProducts.map(
          (product) => (

            <div
              key={product._id}
              className="bg-white border rounded-2xl p-4 shadow-sm"
            >

              {product.images?.[0] && (

                <img
                  src={
                    product.images[0]
                  }
                  className="w-full h-64 object-cover rounded-xl"
                />
              )}

              <h2 className="font-bold mt-4 text-lg">

                {product.name}

              </h2>

              <p className="text-sm text-gray-500">

                {
                  product.category
                }

              </p>

              <div className="mt-3 space-y-1 text-sm">

                <p>

                  <span className="font-semibold">
                    Price:
                  </span>

                  {" "}
                  ₹{product.price}

                </p>

                <p>

                  <span className="font-semibold">
                    Weight:
                  </span>

                  {" "}
                  {product.grams}g

                </p>

                <p>

                  <span className="font-semibold">
                    Stock:
                  </span>

                  {" "}
                  {product.stock}

                </p>
                    <p>

                  <span className="font-semibold">
                    SKu_id:
                  </span>

                  {" "}
                  {product.sku_id}

                </p>

                <p className="break-all">

                  <span className="font-semibold">
                    Batch:
                  </span>

                  {" "}
                  {
                    product.batchid
                  }

                </p>

              </div>

              <div className="flex flex-col gap-3 mt-5">

  <div className="flex gap-3">

    <Link
      href={`/products/edit/${product._id}`}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full text-center"
    >
      Edit
    </Link>

    <button
      onClick={() =>
        deleteProduct(
          product._id
        )
      }
      className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
    >
      Delete
    </button>

  </div>

  <button
  onClick={() =>
    openCertificate(
      product._id
    )
  }
  className="bg-black text-white px-4 py-3 rounded-xl"
>
  View Certificate
</button>

</div>

            </div>
          )
        )}

      </div>

      {/* EMPTY */}

      {filteredProducts.length === 0 && (

        <div className="text-center py-20 text-gray-500">

          No Products Found

        </div>
      )}

    </div>
  );
}