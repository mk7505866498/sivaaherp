import mongoose from "mongoose";

const sourcingSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },

    quantityInGram: {
      type: Number,
      required: true,
    },

    silverRate: {
      type: Number,
      required: true,
    },

    labourPerGram: {
      type: Number,
      required: true,
    },

    vendor: {
      type: String,
      required: true,
    },

    totalCost: {
      type: Number,
      required: true,
    },

    remainingQty: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Sourcing ||
  mongoose.model("Sourcing", sourcingSchema);