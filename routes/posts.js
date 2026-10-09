const router = require("express").Router();
const Post = require("../models/Post");
const redis = require("../config/redis");

const requireLogin = (req, res, next) =>
  req.session.userId ? next() : res.status(401).json({ error: "Login required" });

// READ all posts (with Redis cache)
router.get("/", async (req, res) => {
  const cached = await redis.get("posts:all");
  if (cached) {
    return res.json({ source: "cache", data: JSON.parse(cached) }); // cache HIT
  }

  const posts = await Post.find().populate("author", "name email"); // cache MISS
  await redis.set("posts:all", JSON.stringify(posts), { EX: 60 });  // expires in 60s
  res.json({ source: "db", data: posts });
});

// READ one post
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name email");
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// CREATE (clears cache + publishes an event)
router.post("/", requireLogin, async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.session.userId });
    await redis.del("posts:all"); // cache invalidation
    await redis.publish("new-post", JSON.stringify({ id: post._id, title: post.title }));
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    await redis.del("posts:all");
    res.json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE
router.delete("/:id", requireLogin, async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  await redis.del("posts:all");
  res.json({ message: "Deleted" });
});

module.exports = router;