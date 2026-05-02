const mongoose = require("mongoose");

const caisseSchema = new mongoose.Schema(
  {
    totalCotise: { type: Number, default: 0 },
    seuil: { type: Number, default: 5000000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Caisse", caisseSchema);
