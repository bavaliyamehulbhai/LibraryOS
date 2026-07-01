const express = require("express");
const router = express.Router();
const publisherController = require("../controllers/publisherController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("PUBLISHER_CREATE"), publisherController.createPublisher);
router.get("/", checkPermission("PUBLISHER_VIEW"), publisherController.getPublishers);
router.get("/:id", checkPermission("PUBLISHER_VIEW"), publisherController.getPublisher);
router.get("/:id/stats", checkPermission("PUBLISHER_VIEW"), publisherController.getPublisherStats);
router.put("/:id", checkPermission("PUBLISHER_UPDATE"), publisherController.updatePublisher);
router.delete("/:id", checkPermission("PUBLISHER_DELETE"), publisherController.deletePublisher);

module.exports = router;
