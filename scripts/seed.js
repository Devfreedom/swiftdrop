// Seed script: adds sample users and posts so the stats + indexing demos have data.
// Safe to run more than once: it only deletes the sample data it created,
// never your real data. Run with: node scripts/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

const SEED_DOMAIN = "seed.example"; // anything with this email domain is ours

const users = [
  { name: "Ada Sample", email: "ada@seed.example", password: "password123", role: "user" },
  { name: "Grace Sample", email: "grace@seed.example", password: "password123", role: "user" },
  { name: "Alan Sample", email: "alan@seed.example", password: "password123", role: "user" },
  { name: "Katherine Sample", email: "katherine@seed.example", password: "password123", role: "admin" },
];

// [title, authorIndex, likes]
const posts = [
  ["Understanding MongoDB Documents", 0, 42],
  ["NoSQL vs SQL: When to Use Which", 0, 27],
  ["Getting Started with Redis", 0, 15],
  ["Aggregation Pipeline Basics", 0, 8],
  ["Schema Design for MongoDB", 0, 3],
  ["Normalization in a NoSQL World", 1, 38],
  ["Embedding vs Referencing Explained", 1, 31],
  ["Indexes: How to Make Queries Fast", 1, 22],
  ["Redis Caching Patterns", 1, 12],
  ["Common Mongoose Mistakes", 1, 5],
  ["Building a REST API with Express", 2, 35],
  ["Async/Await Patterns", 2, 24],
  ["Working with Mongoose Middleware", 2, 14],
  ["Error Handling in Express", 2, 6],
  ["Full-Stack Project Ideas", 3, 50],
  ["Deploying a Node.js App", 3, 29],
  ["Git and GitHub Workflow", 3, 11],
  ["Tips for Passing Your Exam", 3, 2],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // clean up ONLY the previous seed run, then re-insert fresh
  const oldUsers = await User.find({ email: { $regex: `@${SEED_DOMAIN}$` } }).select("_id");
  const oldIds = oldUsers.map((u) => u._id);
  await Post.deleteMany({ author: { $in: oldIds } });
  await User.deleteMany({ _id: { $in: oldIds } });
  console.log(`Removed ${oldIds.length} previous sample user(s) and their posts`);

  // create() runs the pre-save hook, so passwords get hashed
  const createdUsers = await User.create(users);
  console.log(`Created ${createdUsers.length} sample users`);

  // insertMany does NOT run pre-save hooks, but posts have no password hook,
  // so it is fine here and much faster
  const docs = posts.map(([title, authorIndex, likes]) => ({
    title,
    body: `Sample body for "${title}". This is demo content created by scripts/seed.js.`,
    author: createdUsers[authorIndex]._id,
    likes,
  }));
  const createdPosts = await Post.insertMany(docs);
  console.log(`Created ${createdPosts.length} sample posts`);

  console.log("\nDone. Log in with any of these (password: password123):");
  createdUsers.forEach((u) => console.log(`  ${u.email}`));

  await mongoose.disconnect();
})().catch(async (e) => {
  console.error("Seed failed:", e.message);
  await mongoose.disconnect();
  process.exit(1);
});
