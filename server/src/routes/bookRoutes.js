const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("BOOK_CREATE"), bookController.createBook);
router.get("/", checkPermission("BOOK_VIEW"), bookController.getBooks);
router.get("/isbn-stats", checkPermission("BOOK_VIEW"), bookController.getIsbnStats);
router.get("/isbn/:isbn", checkPermission("BOOK_VIEW"), bookController.getBookByIsbn);
router.get("/:id", checkPermission("BOOK_VIEW"), bookController.getBook);
router.put("/:id", checkPermission("BOOK_UPDATE"), bookController.updateBook);
router.delete("/:id", checkPermission("BOOK_DELETE"), bookController.deleteBook);

module.exports = router;
