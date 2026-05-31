"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

export default function EditProductPage() {

  const params =
    useParams();
const productId =
  Array.isArray(params?.id)

    ? params.id[0]

    : params?.id;
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [product, setProduct] =
    useState(null);

  const [categories, setCategories] =
    useState([]);

  const [batches, setBatches] =
    useState([]);

  const [newImages, setNewImages] =
    useState([]);

  async function fetchProduct(id) {

    if (!id) return;

    const res =
      await fetch(
        `/api/products/${id}`
      );

    const data =
      await res.json();

    if (data.success) {

      setProduct(data.data);
    }
  }

  async function fetchCategories() {

    const res =
      await fetch(
        "/api/categories/all"
      );

    const data =
      await res.json();

    setCategories(
      data.data || []
    );
  }

  async function fetchBatches() {

    const res =
      await fetch(
        "/api/sourcing/all"
      );

    const data =
      await res.json();

    setBatches(
      data.data || []
    );
  }

useEffect(() => {

  if (!productId)
    return;

  fetchProduct(
    productId
  );

  fetchCategories();

  fetchBatches();

}, [productId]);

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;

    setProduct((prev) => ({

      ...prev,

      [name]: value,
    }));
  }

  function handleSeoChange(
    e
  ) {

    const {
      name,
      value,
    } = e.target;

    setProduct((prev) => ({

      ...prev,

      seo: {

        ...prev.seo,

        [name]: value,
      },
    }));
  }

  function removeImage(index) {

    const updated =
      [...(product.images || [])];

    updated.splice(index, 1);

    setProduct((prev) => ({

      ...prev,

      images: updated,
    }));
  }

  async function uploadNewImages() {

    const uploadedUrls = [];

    for (const image of newImages) {

      const formData =
        new FormData();

      formData.append(
        "file",
        image
      );

      formData.append(
        "upload_preset",
        "sivaah_products"
      );

      const res =
        await fetch(

          "https://api.cloudinary.com/v1_1/dh61336lh/image/upload",

          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await res.json();

      uploadedUrls.push(
        data.secure_url
      );
    }

    return uploadedUrls;
  }

  async function updateProduct() {

    try {

      setLoading(true);

      let uploadedUrls = [];

      if (
        newImages.length > 0
      ) {

        uploadedUrls =
          await uploadNewImages();
      }

      const finalImages = [

        ...(product.images || []),

        ...uploadedUrls,
      ];

      const payload = {

        ...product,

        images:
          finalImages,

        grams:
          Number(
            product.grams
          ),

        labourPerGram:
          Number(
            product.labourPerGram
          ),

        stock:
          Number(
            product.stock
          ),

        benefits:
          typeof product.benefits ===
          "string"

            ? product.benefits
                .split(",")
                .map((b) =>
                  b.trim()
                )

            : product.benefits,
      };

      const res =
        await fetch(

          `/api/products/edit/${productId}`,

          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await res.json();

      if (!data.success) {

        throw new Error();
      }

      await fetch(
        "/api/sync-prices",
        {
          method: "POST",
        }
      );

      alert(
        "Product Updated"
      );

      router.push(
        "/products"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Error updating product"
      );

    } finally {

      setLoading(false);
    }
  }

  if (!product) {

    return (

      <div className="p-10">

        Loading...

      </div>
    );
  }

  return (

    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">

        Edit Product

      </h1>

      <div className="space-y-4">

        <input
          className="w-full border p-3 rounded-xl"
          value={product.name || ""}
          name="name"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          value={product.subtitle || ""}
          name="subtitle"
          onChange={handleChange}
        />

        <select
          className="w-full border p-3 rounded-xl"
          value={product.category || ""}
          name="category"
          onChange={handleChange}
        >

          {categories.map(
            (cat) => (

              <option
                key={cat._id}
                value={cat.name}
              >
                {cat.name}
              </option>
            )
          )}

        </select>

        <input
          className="w-full border p-3 rounded-xl"
          value={product.emotion || ""}
          name="emotion"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          value={product.grams || ""}
          name="grams"
          type="number"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          value={
            product.labourPerGram || ""
          }
          name="labourPerGram"
          type="number"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          value={product.stock || ""}
          name="stock"
          type="number"
          onChange={handleChange}
        />

        <select
          className="w-full border p-3 rounded-xl"
          value={product.batchid || ""}
          name="batchid"
          onChange={handleChange}
        >

          {batches.map(
            (batch) => (

              <option
                key={
                  batch.batchId
                }

                value={
                  batch.batchId
                }
              >
                {
                  batch.batchId
                }
              </option>
            )
          )}

        </select>

        <textarea
          className="w-full border p-3 rounded-xl"
          rows={6}
          value={
            product.description || ""
          }
          name="description"
          onChange={handleChange}
        />

        <textarea
          className="w-full border p-3 rounded-xl"
          rows={4}
          value={
            Array.isArray(
              product.benefits
            )

              ? product.benefits.join(
                  ", "
                )

              : product.benefits || ""
          }

          name="benefits"

          onChange={
            handleChange
          }
        />

        <hr />

        <h2 className="text-xl font-bold">

          SEO

        </h2>

        <input
          className="w-full border p-3 rounded-xl"
          value={
            product.seo?.title || ""
          }
          name="title"
          onChange={
            handleSeoChange
          }
        />

        <textarea
          className="w-full border p-3 rounded-xl"
          value={
            product.seo?.description || ""
          }
          name="description"
          onChange={
            handleSeoChange
          }
        />

        <input
          className="w-full border p-3 rounded-xl"
          value={
            product.seo?.keywords || ""
          }
          name="keywords"
          onChange={
            handleSeoChange
          }
        />

        <hr />

        <h2 className="text-xl font-bold">

          Images

        </h2>

        <div className="flex flex-wrap gap-4">

          {product.images?.map(
            (img, i) => (

              <div
                key={i}
                className="relative"
              >

                <img
                  src={img}
                  className="w-28 h-28 object-cover rounded-lg"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeImage(i)
                  }
                  className="absolute top-0 right-0 bg-red-500 text-white px-2 rounded-full"
                >
                  ×
                </button>

              </div>
            )
          )}

        </div>

        <input
          type="file"
          multiple
          onChange={(e) =>
            setNewImages(
              Array.from(
                e.target.files
              )
            )
          }
        />

        <button
          onClick={
            updateProduct
          }

          disabled={loading}

          className="bg-black text-white px-6 py-3 rounded-xl"
        >

          {
            loading
              ? "Updating..."
              : "Update Product"
          }

        </button>

      </div>

    </div>
  );
}