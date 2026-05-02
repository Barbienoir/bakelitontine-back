const Payment = require("../models/Payment");
const Cotisation = require("../models/Cotisation");
const User = require("../models/User");
const Caisse = require("../models/Caisse");
const { createStripeSession, constructWebhookEvent, stripe } = require("../services/stripeService");
const { createWaveSession } = require("../services/waveService");
const { createNotification } = require("../services/notificationService");
const { sendMail } = require("../services/mailService");
const { factureTemplate } = require("../utils/emailTemplates");

// POST /api/payments/stripe/create-checkout-session
const createStripeCheckout = async (req, res) => {
  try {
    const { montant, mois } = req.body;

    // Créer la cotisation en attente
    const cotisation = await Cotisation.create({
      userId: req.user._id,
      montant: Number(montant),
      mois,
      statut: "en_attente",
    });

    const session = await createStripeSession({
      amount: Number(montant),
      userId: req.user._id.toString(),
      cotisationId: cotisation._id.toString(),
      userEmail: req.user.email,
    });

    // Créer le paiement
    const payment = await Payment.create({
      userId: req.user._id,
      cotisationId: cotisation._id,
      amount: Number(montant),
      provider: "stripe",
      status: "pending",
      transactionId: session.id,
      checkoutUrl: session.url,
    });

    cotisation.paymentId = payment._id;
    await cotisation.save();

    res.json({ checkoutUrl: session.url, payment, cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur Stripe", error: error.message });
  }
};

// POST /api/payments/stripe/webhook
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, cotisationId } = session.metadata;

    try {
      const payment = await Payment.findOneAndUpdate(
        { transactionId: session.id },
        { status: "paid" },
        { new: true }
      );

      const cotisation = await Cotisation.findByIdAndUpdate(
        cotisationId,
        { statut: "valide" },
        { new: true }
      );

      await Caisse.findOneAndUpdate(
        {},
        { $inc: { totalCotise: cotisation.montant } },
        { upsert: true }
      );

      const user = await User.findById(userId);

      // Vérifier seuil atteint
      const total = await Cotisation.aggregate([
        { $match: { userId: cotisation.userId, statut: "valide" } },
        { $group: { _id: null, total: { $sum: "$montant" } } },
      ]);
      if (total[0]?.total >= user.seuil) {
        await User.findByIdAndUpdate(userId, { statut: "termine" });
      }

      // Envoyer facture
      await sendMail({
        to: user.email,
        subject: `Votre facture — ${cotisation.mois} | Bakéli Tontine`,
        html: factureTemplate(`${user.prenom} ${user.nom}`, cotisation, payment),
      });

      await createNotification({
        receiverId: userId,
        title: "Paiement confirmé ✅",
        message: `Votre paiement Stripe de ${cotisation.montant.toLocaleString("fr")} FCFA pour ${cotisation.mois} a été confirmé.`,
        type: "payment",
      });
    } catch (err) {
      console.error("Erreur traitement webhook Stripe:", err);
    }
  }

  res.json({ received: true });
};

// POST /api/payments/wave/create-checkout-session
const createWaveCheckout = async (req, res) => {
  try {
    const { montant, mois } = req.body;

    const cotisation = await Cotisation.create({
      userId: req.user._id,
      montant: Number(montant),
      mois,
      statut: "en_attente",
    });

    const waveData = await createWaveSession({
      amount: Number(montant),
      userId: req.user._id.toString(),
      cotisationId: cotisation._id.toString(),
    });

    const payment = await Payment.create({
      userId: req.user._id,
      cotisationId: cotisation._id,
      amount: Number(montant),
      provider: "wave",
      status: "pending",
      transactionId: waveData.id || "",
      checkoutUrl: waveData.wave_launch_url || waveData.checkout_url || "",
    });

    cotisation.paymentId = payment._id;
    await cotisation.save();

    res.json({ checkoutUrl: payment.checkoutUrl, payment, cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur Wave CI", error: error.message });
  }
};

// POST /api/payments/wave/webhook
const waveWebhook = async (req, res) => {
  try {
    const { client_reference, status, id } = req.body;

    if (status === "succeeded" || status === "completed") {
      const [userId, cotisationId] = (client_reference || "").split("_");

      const payment = await Payment.findOneAndUpdate(
        { cotisationId },
        { status: "paid", transactionId: id },
        { new: true }
      );

      const cotisation = await Cotisation.findByIdAndUpdate(
        cotisationId,
        { statut: "valide" },
        { new: true }
      );

      await Caisse.findOneAndUpdate(
        {},
        { $inc: { totalCotise: cotisation.montant } },
        { upsert: true }
      );

      const user = await User.findById(userId);

      await sendMail({
        to: user.email,
        subject: `Votre facture — ${cotisation.mois} | Bakéli Tontine`,
        html: factureTemplate(`${user.prenom} ${user.nom}`, cotisation, payment),
      });

      await createNotification({
        receiverId: userId,
        title: "Paiement Wave confirmé ✅",
        message: `Votre paiement Wave de ${cotisation.montant.toLocaleString("fr")} FCFA pour ${cotisation.mois} a été confirmé.`,
        type: "payment",
      });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur webhook Wave" });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("cotisationId")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  createStripeCheckout, stripeWebhook,
  createWaveCheckout, waveWebhook,
  getMyPayments,
};
