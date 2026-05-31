"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

export default function AddProduct() {

  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [images, setImages] =
    useState([]);

  const [preview, setPreview] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [batches, setBatches] =
    useState([]);

  const [form, setForm] =
    useState({

      name: "",
      subtitle: "",
      emotion: "Love",
      category: "",
      description: "",
      benefits: "",
      grams: "",
      labourPerGram: "",
      stock: "",
      batchid: "",

      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",

      isActive: true,
    });

  useEffect(() => {

    fetchCategories();

    fetchBatches();

  }, []);

  async function fetchCategories() {

    try {

      const res =
        await fetch(
          "/api/categories/all"
        );

      const data =
        await res.json();

      setCategories(
        data.data || []
      );

    } catch (err) {

      console.log(err);
    }
  }

  async function fetchBatches() {

    try {

      const res =
        await fetch(
          "/api/sourcing/all"
        );

      const data =
        await res.json();

      setBatches(
        data.data || []
      );

    } catch (err) {

      console.log(err);
    }
  }

  function generateSlug(text) {

    return text
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /(^-|-$)+/g,
        ""
      );
  }

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleImages(e) {

    const files =
      Array.from(
        e.target.files
      );

    setImages(files);

    setPreview(
      files.map((img) =>
        URL.createObjectURL(img)
      )
    );
  }

const uploadImagesToCloudinary =
  async () => {

    const uploadedUrls = [];

    for (const image of images) {

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

      if (!res.ok) {

        throw new Error(
          "Cloudinary upload failed"
        );
      }

      const data =
        await res.json();

      uploadedUrls.push(
        data.secure_url
      );
    }

    return uploadedUrls;
};

  async function submitProduct() {

    if (
      !form.name ||
      !form.category ||
      !form.grams ||
      !form.labourPerGram ||
      !form.stock ||
      !form.batchid ||
      images.length === 0
    ) {

      alert(
        "Fill all required fields"
      );

      return;
    }

    try {

      setLoading(true);

     const imageUrls =
  await uploadImagesToCloudinary();

      const payload = {

        name:
          form.name,

        subtitle:
          form.subtitle,

        emotion:
          form.emotion,

        category:
          form.category,

        slug:
          generateSlug(
            form.name
          ),

        description:
          form.description,

        benefits:
          form.benefits
            .split(",")
            .map((b) =>
              b.trim()
            )
            .filter(Boolean),

        grams:
          Number(
            form.grams
          ),

        labourPerGram:
          Number(
            form.labourPerGram
          ),

        stock:
          Number(
            form.stock
          ),

        batchid:
          form.batchid,

        images:
          imageUrls,

        material:
          "925 Silver",

        seo: {

          title:
            form.seoTitle,

          description:
            form.seoDescription,

          keywords:
            form.seoKeywords,
        },

        isActive: true,
      };

      const res =
        await fetch(
          "/api/products/add",
          {

            method: "POST",

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

      if (!data.success)
        throw new Error();

      alert(
        "Product Added"
      );

      router.push(
        "/products"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Error adding product"
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">

        Add Product

      </h1>

      <div className="space-y-4">

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Name"
          name="name"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Subtitle"
          name="subtitle"
          onChange={handleChange}
        />

        <select
          className="w-full border p-3 rounded-xl"
          name="category"
          onChange={handleChange}
        >

          <option>
            Select Category
          </option>

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

        <select
          className="w-full border p-3 rounded-xl"
          name="emotion"
          onChange={handleChange}
        >

          <option>
            Love
          </option>

          <option>
            Protection
          </option>

          <option>
            Peace
          </option>

          <option>
            Healing
          </option>

        </select>

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Weight (grams)"
          type="number"
          name="grams"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Pricing Labour/g"
          type="number"
          name="labourPerGram"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Stock"
          type="number"
          name="stock"
          onChange={handleChange}
        />

        <select
          className="w-full border p-3 rounded-xl"
          name="batchid"
          onChange={handleChange}
        >

          <option>
            Select Batch
          </option>

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
          placeholder="Description"
          name="description"
          rows={5}
          onChange={handleChange}
        />

        <textarea
          className="w-full border p-3 rounded-xl"
          placeholder="Benefits comma separated"
          name="benefits"
          onChange={handleChange}
        />

        <hr />

        <h2 className="text-xl font-bold">

          SEO

        </h2>

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="SEO Title"
          name="seoTitle"
          onChange={handleChange}
        />

        <textarea
          className="w-full border p-3 rounded-xl"
          placeholder="SEO Description"
          name="seoDescription"
          onChange={handleChange}
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="SEO Keywords"
          name="seoKeywords"
          onChange={handleChange}
        />

        <input
          type="file"
          multiple
          onChange={handleImages}
        />

        <div className="flex gap-3 flex-wrap">

          {preview.map(
            (src, i) => (

              <img
                key={i}
                src={src}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )
          )}

        </div>

        <button
          onClick={
            submitProduct
          }

          disabled={loading}

          className="bg-black text-white px-6 py-3 rounded-xl"
        >

          {
            loading
              ? "Saving..."
              : "Add Product"
          }

        </button>

      </div>

    </div>
  );
}