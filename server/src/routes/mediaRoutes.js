const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const uploadImage = require("../middleware/uploadImage");

router.use(authMiddleware);

// Gallery & Stats
router.get("/gallery", checkPermission("BOOK_VIEW"), mediaController.getGallery);
router.get("/cover-stats", checkPermission("BOOK_VIEW"), mediaController.getCoverStats);

// Cover Actions
router.post("/:id/upload-cover", checkPermission("BOOK_COVER_UPDATE"), uploadImage.single("image"), mediaController.uploadCover);
router.put("/:id/replace-cover", checkPermission("BOOK_COVER_UPDATE"), uploadImage.single("image"), mediaController.replaceCover);
router.delete("/:id/remove-cover", checkPermission("BOOK_COVER_DELETE"), mediaController.removeCover);

module.exports = router;
