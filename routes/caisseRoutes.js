const express = require("express");
const { getCaisse, updateSeuil } = require("../controllers/caisseController");
const { protect } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

router.use(protect);
router.get("/", getCaisse);
router.patch("/seuil", isAdmin, updateSeuil);

module.exports = router;
