const mongoose = require("mongoose");

const cotisationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    montant: { type: Number, required: true, min: 0 },
    mois: { type: String, required: true },
    date: { type: Date, default: Date.now },
    statut: {
      type: String,
      enum: ["valide", "en_attente", "rejete"],
      default: "en_attente",
    },
    preuve: { type: String, default: "" },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    factureUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cotisation", cotisationSchema);
