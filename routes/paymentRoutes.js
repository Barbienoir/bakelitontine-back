const express = require("express");
const {
  createStripeCheckout, stripeWebhook,
  createWaveCheckout, waveWebhook,
  getMyPayments,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/stripe/webhook", stripeWebhook);
router.post("/wave/webhook", waveWebhook);

router.use(protect);
router.post("/stripe/create-checkout-session", createStripeCheckout);
router.post("/wave/create-checkout-session", createWaveCheckout);
router.get("/my", getMyPayments);

module.exports = router;
