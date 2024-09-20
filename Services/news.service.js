const { query } = require("../Config/database.config");

// Add news to the database
const addNews = async (newsData, posted_by) => {
  const { title, content } = newsData;

  if (!title || !content) {
    return {
      success: false,
      message: "Title and content are required",
    };
  }

  const addNewsQuery = `
    INSERT INTO news (title, content, posted_by)
    VALUES (?, ?, ?);
  `;
  try {
    await query(addNewsQuery, [title, content, posted_by]);
    return {
      success: true,
      message: "News added successfully",
    };
  } catch (err) {
    throw new Error("Error adding news: " + err.message);
  }
};

// Get all news from the database
const getNews = async () => {
  const getNewsQuery = `
    SELECT n.news_id, n.title, n.content, n.created_at, u.name AS posted_by, r.role_name AS role
    FROM news n
    JOIN users u ON n.posted_by = u.user_id
    JOIN roles r ON u.role_id = r.role_id
    ORDER BY n.created_at DESC;
  `;

  try {
    const result = await query(getNewsQuery);
    return {
      success: true,
      result,
    };
  } catch (err) {
    throw new Error("Error fetching news: " + err.message);
  }
};
// Get news by user ID
const getNewsByUserId = async (userId) => {
  const getNewsByUserIdQuery = `
    SELECT n.news_id, n.title, n.content, n.created_at
    FROM news n
    WHERE n.posted_by = ?
    ORDER BY n.created_at DESC;
  `;

  try {
    const result = await query(getNewsByUserIdQuery, [userId]);
    return {
      success: true,
      result,
    };
  } catch (err) {
    throw new Error("Error fetching news by user ID: " + err.message);
  }
};
// Update news by ID
const updateNews = async (newsId, updatedNewsData) => {
  const { title, content } = updatedNewsData;

  if (!title || !content) {
    return {
      success: false,
      message: "Title and content are required",
    };
  }

  const updateNewsQuery = `
    UPDATE news
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE news_id = ?;
  `;

  try {
    const result = await query(updateNewsQuery, [title, content, newsId]);

    return {
      success: true,
      message: "News updated successfully",
    };
  } catch (err) {
    throw new Error("Error updating news: " + err.message);
  }
};

// Delete news by ID
const deleteNews = async (newsId) => {
  const deleteNewsQuery = `
    DELETE FROM news WHERE news_id = ?;
  `;

  try {
    const result = await query(deleteNewsQuery, [newsId]);

    return {
      success: true,
      message: "News deleted successfully",
    };
  } catch (err) {
    throw new Error("Error deleting news: " + err.message);
  }
};

module.exports = {
  addNews,
  getNews,
  getNewsByUserId,
  updateNews,
  deleteNews,
};
