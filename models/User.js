const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telephone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "membre"], default: "membre" },
    profession: { type: String, default: "" },
    adresse: { type: String, default: "" },
    organisation: { type: String, default: "" },
    dateNaissance: { type: Date },
    avatar: { type: String, default: "" },
    statut: {
      type: String,
      enum: ["en_cours", "termine", "archive", "bloque"],
      default: "en_cours",
    },
    dateDebut: { type: Date, default: Date.now },
    seuil: { type: Number, default: 300000 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);