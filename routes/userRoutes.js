const express = require("express");
const {
  getAllUsers, getUserStats, getUserById,
  createUser, updateUser, updateStatut,
  getArchivedUsers, getBlockedUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { uploadAvatar } = require("../config/cloudinary");

const router = express.Router();

router.use(protect);

router.get("/stats", isAdmin, getUserStats);
router.get("/archives", isAdmin, getArchivedUsers);
router.get("/bloques", isAdmin, getBlockedUsers);
router.get("/", isAdmin, getAllUsers);
router.post("/", isAdmin, uploadAvatar.single("avatar"), createUser);
router.get("/:id", getUserById);
// ❌ Avant
router.put("/:id", uploadAvatar.single("avatar"), updateUser);

// ✅ Après
router.put("/:id", (req, res, next) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary error:", err.message);
      return res.status(500).json({ message: err.message });
    }
    next();
  });
}, updateUser);
// router.put("/:id", uploadAvatar.single("avatar"), updateUser);
router.patch("/:id/statut", isAdmin, updateStatut);

module.exports = router;
