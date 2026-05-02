const Caisse = require("../models/Caisse");

const getCaisse = async (req, res) => {
  try {
    let caisse = await Caisse.findOne();
    if (!caisse) caisse = await Caisse.create({ totalCotise: 0, seuil: 5000000 });
    res.json(caisse);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateSeuil = async (req, res) => {
  try {
    const { seuil } = req.body;
    const caisse = await Caisse.findOneAndUpdate({}, { seuil }, { new: true, upsert: true });
    res.json({ message: "Seuil mis à jour", caisse });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getCaisse, updateSeuil };
