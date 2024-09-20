const checkUser = async (req, res) => {
  const { role_id, batch_ids, user_id, stream_id } = req.user;
  return res.json({
    message: "User authenticated successfully",
    success: true,
    role_id,
    batch_ids,
    user_id,
    stream_id,
  });
};
module.exports = { checkUser };
