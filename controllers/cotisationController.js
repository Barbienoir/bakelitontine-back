const Cotisation = require("../models/Cotisation");
const Caisse = require("../models/Caisse");
const User = require("../models/User");
const { sendMail } = require("../services/mailService");
const { createNotification } = require("../services/notificationService");
const { cotisationValideTemplate, cotisationRejeteTemplate, factureTemplate } = require("../utils/emailTemplates");

const getAllCotisations = async (req, res) => {
  try {
    const { mois, statut, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (mois) filter.mois = mois;
    if (statut) filter.statut = statut;

    const cotisations = await Cotisation.find(filter)
      .populate("userId", "prenom nom email avatar")
      .populate("paymentId")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Cotisation.countDocuments(filter);
    res.json({ cotisations, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMonthlyStats = async (req, res) => {
  try {
    const stats = await Cotisation.aggregate([
      { $match: { statut: "valide" } },
      {
        $group: {
          _id: "$mois",
          total: { $sum: "$montant" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statutStats = await Cotisation.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ monthly: stats, byStatut: statutStats });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMyCotisations = async (req, res) => {
  try {
    const cotisations = await Cotisation.find({ userId: req.user._id })
      .populate("paymentId")
      .sort({ createdAt: -1 });

    const user = await User.findById(req.user._id);
    const totalCotise = cotisations
      .filter((c) => c.statut === "valide")
      .reduce((acc, c) => acc + c.montant, 0);
    const montantRestant = Math.max(0, user.seuil - totalCotise);

    res.json({ cotisations, totalCotise, montantRestant });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const createCotisation = async (req, res) => {
  try {
    const { montant, mois } = req.body;

    const cotisation = await Cotisation.create({
      userId: req.user._id,
      montant: Number(montant),
      mois,
      statut: "en_attente",
      preuve: req.file?.path || "",
    });

    // Notifier les admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification({
        receiverId: admin._id,
        title: "Nouvelle cotisation",
        message: `${req.user.prenom} ${req.user.nom} a soumis une cotisation de ${Number(montant).toLocaleString("fr")} FCFA pour ${mois}.`,
        type: "cotisation",
      });
    }

    // Notifier le membre
    await createNotification({
      receiverId: req.user._id,
      title: "Cotisation soumise",
      message: `Votre cotisation de ${Number(montant).toLocaleString("fr")} FCFA pour ${mois} est en attente de validation.`,
      type: "info",
    });

    res.status(201).json({ message: "Cotisation soumise avec succès", cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const validerCotisation = async (req, res) => {
  try {
    const cotisation = await Cotisation.findById(req.params.id).populate("paymentId");
    if (!cotisation) return res.status(404).json({ message: "Cotisation introuvable" });
    if (cotisation.statut === "valide") return res.status(400).json({ message: "Déjà validée" });

    cotisation.statut = "valide";
    await cotisation.save();

    // Mettre à jour la caisse
    await Caisse.findOneAndUpdate(
      {},
      { $inc: { totalCotise: cotisation.montant } },
      { upsert: true }
    );

    const user = await User.findById(cotisation.userId);

    // Vérifier si seuil atteint
    const totalMembre = await Cotisation.aggregate([
      { $match: { userId: cotisation.userId, statut: "valide" } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);
    if (totalMembre[0]?.total >= user.seuil) {
      await User.findByIdAndUpdate(cotisation.userId, { statut: "termine" });
    }

    // Envoyer email de validation avec facture
    await sendMail({
      to: user.email,
      subject: `Cotisation validée — ${cotisation.mois} | Bakéli Tontine`,
      html: cotisationValideTemplate(`${user.prenom} ${user.nom}`, cotisation),
    });

    // Envoyer la facture si paiement existant
    if (cotisation.paymentId) {
      await sendMail({
        to: user.email,
        subject: `Votre facture — ${cotisation.mois} | Bakéli Tontine`,
        html: factureTemplate(`${user.prenom} ${user.nom}`, cotisation, cotisation.paymentId),
      });
    }

    // Notification
    await createNotification({
      receiverId: cotisation.userId,
      title: "Cotisation validée ✅",
      message: `Votre cotisation de ${cotisation.montant.toLocaleString("fr")} FCFA pour ${cotisation.mois} a été validée.`,
      type: "success",
    });

    res.json({ message: "Cotisation validée", cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const rejeterCotisation = async (req, res) => {
  try {
    const cotisation = await Cotisation.findById(req.params.id);
    if (!cotisation) return res.status(404).json({ message: "Cotisation introuvable" });

    cotisation.statut = "rejete";
    await cotisation.save();

    const user = await User.findById(cotisation.userId);

    await sendMail({
      to: user.email,
      subject: `Cotisation rejetée — ${cotisation.mois} | Bakéli Tontine`,
      html: cotisationRejeteTemplate(`${user.prenom} ${user.nom}`, cotisation),
    });

    await createNotification({
      receiverId: cotisation.userId,
      title: "Cotisation rejetée ❌",
      message: `Votre cotisation de ${cotisation.montant.toLocaleString("fr")} FCFA pour ${cotisation.mois} a été rejetée.`,
      type: "error",
    });

    res.json({ message: "Cotisation rejetée", cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getCotisationById = async (req, res) => {
  try {
    const cotisation = await Cotisation.findById(req.params.id)
      .populate("userId", "prenom nom email telephone avatar")
      .populate("paymentId");
    if (!cotisation) return res.status(404).json({ message: "Cotisation introuvable" });
    res.json(cotisation);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getAllCotisations, getMonthlyStats, getMyCotisations,
  createCotisation, validerCotisation, rejeterCotisation, getCotisationById,
};
