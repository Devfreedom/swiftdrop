const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");

// 1. Count users
router.get("/users-count", async (req, res) => {
  const [result] = await User.aggregate([{ $count: "total" }]);
  res.json(result || { total: 0 });
});

// 2. Posts per user, joined with user details
router.get("/posts-per-user", async (req, res) => {
  const data = await Post.aggregate([
    { $group: { _id: "$author", totalPosts: { $sum: 1 } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { _id: 0, name: "$user.name", email: "$user.email", totalPosts: 1 } },
    { $sort: { totalPosts: -1 } },
  ]);
  res.json(data);
});

// 3. Most liked posts + average and total likes
router.get("/popular", async (req, res) => {
  const top = await Post.aggregate([
    { $sort: { likes: -1 } },
    { $limit: 5 },
    { $project: { title: 1, likes: 1 } },
  ]);
  const [totals] = await Post.aggregate([
    { $group: { _id: null, avgLikes: { $avg: "$likes" }, totalLikes: { $sum: "$likes" } } },
  ]);
  res.json({ top, ...(totals || { avgLikes: 0, totalLikes: 0 }) });
});

// 4. Search posts by minimum likes, with pagination
router.get("/search", async (req, res) => {
  const minLikes = Number(req.query.minLikes) || 0;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 50);

  const filter = { likes: { $gte: minLikes } };

  const posts = await Post.aggregate([
    { $match: filter },
    { $sort: { likes: -1, createdAt: -1 } },
    { $skip: (page - 1) * limit }, // skip = how many docs to jump past
    { $limit: limit },             // then take this many
    { $project: { title: 1, likes: 1, author: 1, createdAt: 1 } },
  ]);

  // total matching docs, so the client knows how many pages exist
  const [total] = await Post.aggregate([{ $match: filter }, { $count: "total" }]);

  res.json({ page, limit, total: total ? total.total : 0, posts });
});

module.exports = router;