const express = require("express");
const {
  getAllCotisations, getMonthlyStats, getMyCotisations,
  createCotisation, validerCotisation, rejeterCotisation, getCotisationById,
} = require("../controllers/cotisationController");
const { protect } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { uploadPreuve } = require("../config/cloudinary");

const router = express.Router();

router.use(protect);

router.get("/monthly-stats", isAdmin, getMonthlyStats);
router.get("/my", getMyCotisations);
router.get("/", isAdmin, getAllCotisations);
router.post("/", uploadPreuve.single("preuve"), createCotisation);
router.patch("/:id/valider", isAdmin, validerCotisation);
router.patch("/:id/rejeter", isAdmin, rejeterCotisation);
router.get("/:id", getCotisationById);

module.exports = router;
