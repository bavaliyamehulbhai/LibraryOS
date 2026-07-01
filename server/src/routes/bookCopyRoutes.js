const express = require("express");
const router = express.Router();
const bookCopyController = require("../controllers/bookCopyController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Get queries
router.get("/", checkPermission("COPY_VIEW"), bookCopyController.getCopies);
router.get("/:id", checkPermission("COPY_VIEW"), bookCopyController.getCopy);
router.get("/:id/history", checkPermission("COPY_VIEW"), bookCopyController.getCopyHistory);

// Creation
router.post("/", checkPermission("COPY_CREATE"), bookCopyController.createCopy);
router.post("/bulk", checkPermission("COPY_CREATE"), bookCopyController.bulkCreateCopies);

// Lifecycle actions
router.post("/issue", checkPermission("COPY_UPDATE"), bookCopyController.issueCopy);
router.post("/return", checkPermission("COPY_UPDATE"), bookCopyController.returnCopy);
router.post("/reserve", checkPermission("COPY_UPDATE"), bookCopyController.reserveCopy);
router.post("/lost", checkPermission("COPY_UPDATE"), bookCopyController.markLost);
router.post("/damaged", checkPermission("COPY_UPDATE"), bookCopyController.markDamaged);

// Specific updates
router.put("/:id/shelf", checkPermission("COPY_UPDATE"), bookCopyController.assignShelf);
router.put("/:id/condition", checkPermission("COPY_UPDATE"), bookCopyController.updateCondition);

module.exports = router;
