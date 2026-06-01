"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

export default function VerifyPage() {

  const params =
    useParams();

  const [certificate, setCertificate] =
    useState(null);

  async function fetchCertificate() {

    const res =
      await fetch(

        `/api/certificates/${params.slug}`
      );

    const data =
      await res.json();

    setCertificate(
      data.data
    );
  }

  useEffect(() => {

    if (!params?.slug)
      return;

    fetchCertificate();

  }, [params?.slug]);

  if (!certificate) {

    return (

      <div className="p-10">

        Loading...

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-black text-white p-8">

      <div className="max-w-3xl mx-auto border border-gray-700 rounded-3xl p-8">

        <div className="text-center">

          <h1 className="text-4xl font-bold">

            SIVAAH

          </h1>

          <p className="mt-2 text-gray-400">

            Real Weight • Honest Price

          </p>

        </div>

        <div className="mt-10 text-center">

          <h2 className="text-3xl font-bold">

            Certificate of Authenticity

          </h2>

          <p className="mt-4 text-gray-300">

            This jewellery piece
            has been crafted using
            authentic 925 Sterling Silver
            and verified by Sivaah.

          </p>

        </div>

        <div className="mt-10 flex justify-center">

          <img
            src={
              certificate.productImage
            }
            className="w-72 rounded-2xl"
          />

        </div>

        <div className="mt-10 space-y-4 text-lg">

          <div className="flex justify-between">

            <span>
              Product
            </span>

            <span className="font-semibold">

              {
                certificate.productName
              }

            </span>

          </div>

          <div className="flex justify-between">

            <span>
              Purity
            </span>

            <span className="font-semibold">

              {
                certificate.purity
              }

            </span>

          </div>

          <div className="flex justify-between">

            <span>
              Weight
            </span>

            <span className="font-semibold">

              {
                certificate.weight
              }g

            </span>

          </div>

          <div className="flex justify-between">

            <span>
              Batch ID
            </span>

            <span className="font-semibold">

              {
                certificate.batchid
              }

            </span>

          </div>

          <div className="flex justify-between">

            <span>
              Status
            </span>

            <span className="text-green-400 font-semibold">

              VERIFIED

            </span>

          </div>

        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">

          <h3 className="text-2xl font-bold">

            Jewellery Care

          </h3>

          <ul className="mt-4 space-y-3 text-gray-300">

            <li>
              • Keep away from water & perfume
            </li>

            <li>
              • Store in dry place
            </li>

            <li>
              • Clean gently with soft cloth
            </li>

            <li>
              • Store inside Sivaah pouch
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
}