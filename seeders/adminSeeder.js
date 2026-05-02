require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("✅ Un admin existe déjà :", existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      prenom: process.env.ADMIN_PRENOM || "Ndiaga",
      nom: process.env.ADMIN_NOM || "SALL",
      email: process.env.ADMIN_EMAIL || "admin@bakeli.com",
      telephone: process.env.ADMIN_TELEPHONE || "770000000",
      password: process.env.ADMIN_PASSWORD || "password123",
      role: "admin",
      statut: "en_cours",
    });

    console.log("🎉 Admin créé avec succès :", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seed admin :", error.message);
    process.exit(1);
  }
};

seedAdmin();
