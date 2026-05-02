const express = require("express");

const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// DEBUG (optionnel mais utile pour vérifier)
console.log("authController:", authController);

// Vérification sécurisée des fonctions
if (typeof authController.register !== "function") {
  throw new Error("register n'est pas une fonction - vérifie authController");
}
if (typeof authController.login !== "function") {
  throw new Error("login n'est pas une fonction - vérifie authController");
}

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/me", protect, authController.getMe);

module.exports = router;