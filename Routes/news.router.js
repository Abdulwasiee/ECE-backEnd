const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middlewire/Auth");
const newsController = require("../Controllers/news.controller");

// Route to post new news
router.post("/api/postNews", authMiddleware([1, 4]), newsController.postNews);

// Route to get all news
router.get(
  "/api/getNews",
  authMiddleware([1, 2, 3, 4, 5]),
  newsController.fetchNews
);

router.get(
  "/api/getNewsByUser",
  authMiddleware([1, 4]),
  newsController.fetchNewsByUserId
);
// Route to update news by ID
router.put(
  "/api/updateNews/:newsId",
  authMiddleware([1, 4]),
  newsController.updateNewsById
);

// Route to delete news by ID
router.delete(
  "/api/deleteNews/:newsId",
  authMiddleware([1, 4]),
  newsController.deleteNewsById
);

module.exports = router;
