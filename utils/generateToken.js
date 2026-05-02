const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const generateResetToken = () => crypto.randomBytes(32).toString("hex");

module.exports = { generateJWT, generateResetToken };
