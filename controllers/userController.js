const User = require("../models/User");
const Cotisation = require("../models/Cotisation");
const { sendMail } = require("../services/mailService");
const { welcomeTemplate } = require("../utils/emailTemplates");
const { createNotification } = require("../services/notificationService");

const getAllUsers = async (req, res) => {
  try {
    const { statut, page = 1, limit = 8 } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;

    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    // Calcul progression pour chaque user
    const usersWithProgression = await Promise.all(
      users.map(async (u) => {
        const cotisations = await Cotisation.find({ userId: u._id, statut: "valide" });
        const totalCotise = cotisations.reduce((acc, c) => acc + c.montant, 0);
        const progression = Math.round((totalCotise / u.seuil) * 100);
        return { ...u.toObject(), totalCotise, progression };
      })
    );

    res.json({ users: usersWithProgression, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "membre" });
    const actifs = await User.countDocuments({ role: "membre", statut: { $in: ["en_cours", "termine"] } });
    const bloques = await User.countDocuments({ statut: "bloque" });
    const archives = await User.countDocuments({ statut: "archive" });
    const termines = await User.countDocuments({ statut: "termine" });

    res.json({ total, actifs, bloques, archives, termines });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const cotisations = await Cotisation.find({ userId: user._id, statut: "valide" });
    const totalCotise = cotisations.reduce((acc, c) => acc + c.montant, 0);
    const progression = Math.round((totalCotise / user.seuil) * 100);

    res.json({ ...user.toObject(), totalCotise, progression, nombreCotisations: cotisations.length });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const createUser = async (req, res) => {
  try {
    const { prenom, nom, email, telephone, password, profession, adresse, organisation, dateNaissance, seuil } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { telephone }] });
    if (existing) {
      return res.status(400).json({ message: "Email ou téléphone déjà utilisé" });
    }

    const user = await User.create({
      prenom, nom, email, telephone, password,
      profession, adresse, organisation, dateNaissance,
      seuil: seuil || 300000,
      role: "membre",
      avatar: req.file?.path || "",
    });

    await sendMail({
      to: user.email,
      subject: "Bienvenue sur Bakéli Tontine",
      html: welcomeTemplate(user.prenom),
    });

    res.status(201).json({
      message: "Membre créé",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    if (req.file) updates.avatar = req.file.path;

    console.log("req.file:", req.file);        // ✅ Voir si le fichier arrive
    console.log("updates:", updates);           // ✅ Voir les données
    console.log("id:", req.params.id);          // ✅ Voir l'id

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json({ message: "Mis à jour", user });
  } catch (error) {
    console.error("updateUser error:", error.message); // ✅ Voir l'erreur
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const validStatuts = ["en_cours", "termine", "archive", "bloque"];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const statutMessages = {
      bloque: { title: "Compte bloqué", message: "Votre compte a été bloqué par l'administrateur.", type: "error" },
      archive: { title: "Compte archivé", message: "Votre compte a été archivé.", type: "warning" },
      en_cours: { title: "Compte réactivé", message: "Votre compte a été réactivé.", type: "success" },
      termine: { title: "Tontine terminée", message: "Félicitations ! Vous avez atteint votre seuil.", type: "success" },
    };

    if (statutMessages[statut]) {
      await createNotification({
        receiverId: user._id,
        ...statutMessages[statut],
      });
    }

    res.json({ message: "Statut mis à jour", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getArchivedUsers = async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const users = await User.find({ statut: "archive" })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ updatedAt: -1 });

    const total = await User.countDocuments({ statut: "archive" });
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const users = await User.find({ statut: "bloque" })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ updatedAt: -1 });

    const total = await User.countDocuments({ statut: "bloque" });
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getAllUsers, getUserStats, getUserById,
  createUser, updateUser, updateStatut,
  getArchivedUsers, getBlockedUsers,
};
