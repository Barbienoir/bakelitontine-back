const crypto = require("crypto");
const User = require("../models/User");
const { generateJWT, generateResetToken } = require("../utils/generateToken");
const { sendMail } = require("../services/mailService");
const { welcomeTemplate, resetPasswordTemplate } = require("../utils/emailTemplates");


const register = async (req, res) => {
  try {
    const { prenom, nom, email, telephone, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { telephone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email ou téléphone déjà utilisé" });
    }

    const user = await User.create({ prenom, nom, email, telephone, password });

    // Envoyer email de bienvenue
    await sendMail({
      to: user.email,
      subject: "Bienvenue sur Bakéli Tontine 🎉",
      html: welcomeTemplate(`${user.prenom} ${user.nom}`),
    });

    res.status(201).json({
      token: generateJWT(user._id),
      user: {
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        avatar: user.avatar,
        statut: user.statut,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { telephone: identifier }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    if (user.statut === "bloque") {
      return res.status(403).json({ message: "Compte bloqué. Contactez l'administrateur." });
    }

    res.json({
      token: generateJWT(user._id),
      user: {
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        avatar: user.avatar,
        statut: user.statut,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { telephone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const resetToken = generateResetToken();
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 heure
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe — Bakéli Tontine",
      html: resetPasswordTemplate(`${user.prenom} ${user.nom}`, resetUrl),
    });

    res.json({ message: "Email de réinitialisation envoyé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {register, login, forgotPassword, resetPassword, getMe };
