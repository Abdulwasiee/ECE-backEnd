const {
  addNews,
  getNews,
  updateNews,
  deleteNews,
  getNewsByUserId,
  getNewsById,
} = require("../Services/news.service");
const { decrypt } = require("../Services/decyptor.service");
const postNews = async (req, res) => {
  const newsData = req.body;
  const posted_by = req.user.user_id;
  try {
    const result = await addNews(newsData, posted_by);
    return res.json({
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const fetchNews = async (req, res) => {
  try {
    const result = await getNews();
    return res.json({
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const fetchNewsById = async (req, res) => {
  const { newsId } = req.params;
  const decryptedId = decrypt(newsId);
  try {
    const result = await getNewsById(decryptedId);
    return res.json({
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// Fetch news by user ID
const fetchNewsByUserId = async (req, res) => {
  const { user_id } = req.user;
  try {
    const result = await getNewsByUserId(user_id);
    return res.json({
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update News
const updateNewsById = async (req, res) => {
  const { newsId } = req.params;
  const decryptedId = decrypt(newsId);
  const updatedNewsData = req.body;

  try {
    const result = await updateNews(decryptedId, updatedNewsData);
    return res.json({
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete News
const deleteNewsById = async (req, res) => {
  const { newsId } = req.params;

  try {
    const result = await deleteNews(newsId);

    return res.json({
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  postNews,
  fetchNews,
  fetchNewsById,
  fetchNewsByUserId,
  updateNewsById,
  deleteNewsById,
};
