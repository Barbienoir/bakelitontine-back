const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async ({ amount, userId, cotisationId, userEmail }) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "xof",
          product_data: {
            name: "Cotisation Bakéli Tontine",
            description: `Paiement de cotisation`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: { userId, cotisationId },
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return session;
};

const constructWebhookEvent = (payload, sig) =>
  Stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

module.exports = { createStripeSession, constructWebhookEvent, stripe };
