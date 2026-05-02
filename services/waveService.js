const axios = require("axios");

const createWaveSession = async ({ amount, userId, cotisationId }) => {
  const response = await axios.post(
    `${process.env.WAVE_BASE_URL}/v1/checkout/sessions`,
    {
      amount: String(amount),
      currency: "XOF",
      success_url: process.env.WAVE_SUCCESS_URL,
      error_url: process.env.WAVE_ERROR_URL,
      client_reference: `${userId}_${cotisationId}`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

module.exports = { createWaveSession };
