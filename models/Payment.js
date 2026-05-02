const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cotisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotisation",
      default: null,
    },
    amount: { type: Number, required: true },
    provider: {
      type: String,
      enum: ["stripe", "wave", "manuel"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, default: "" },
    checkoutUrl: { type: String, default: "" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
