// Indexing demo: shows which plan MongoDB picks (IXSCAN vs COLLSCAN),
// how many documents it examined, and how long it took.
// Run with: node scripts/index-demo.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

// walk the plan tree and collect every stage type we find
function collectStages(plan, found = []) {
  if (!plan) return found;
  if (plan.stage) found.push(plan.stage);
  if (plan.inputStage) collectStages(plan.inputStage, found);
  if (plan.inputStages) plan.inputStages.forEach((s) => collectStages(s, found));
  if (plan.thenStage) collectStages(plan.thenStage, found);
  if (plan.elseStage) collectStages(plan.elseStage, found);
  return found;
}

// an IXSCAN anywhere in the tree means MongoDB is using an index.
// stages can be wrapped, e.g. "EXPRESS_IXSCAN", so match on substring.
function winner(explain) {
  const stages = collectStages(explain.queryPlanner?.winningPlan);
  if (stages.some((s) => s.includes("IXSCAN"))) return `IXSCAN (index used) [${stages.join(" -> ")}]`;
  if (stages.some((s) => s.includes("COLLSCAN"))) return `COLLSCAN (full collection scan) [${stages.join(" -> ")}]`;
  return stages.join(" -> ") || "unknown";
}

function report(label, explain) {
  const stats = explain.executionStats || {};
  console.log(`\n--- ${label} ---`);
  console.log(`  winning plan : ${winner(explain)}`);
  console.log(`  docsExamined : ${stats.totalDocsExamined}`);
  console.log(`  nReturned    : ${stats.nReturned}`);
  console.log(`  time (ms)    : ${stats.executionTimeMillis}`);
}

async function printIndexes(collection, name) {
  const indexes = await collection.indexes();
  console.log(`\nIndexes on ${name}:`);
  indexes.forEach((ix) => {
    const key = Object.entries(ix.key).map(([k, v]) => `${k}: ${v}`).join(", ");
    console.log(`  ${ix.name}  ->  { ${key} }  ${ix.unique ? "(unique)" : ""}`);
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected\n");

  await printIndexes(User.collection, "users");
  await printIndexes(Post.collection, "posts");

  // 1. find a user by email -- users.email has a unique index
  const anyUser = (await User.findOne({ email: "ada@seed.example" })) || (await User.findOne());
  if (anyUser) {
    const explain = await User.findOne({ email: anyUser.email }).explain("executionStats");
    report(`User.findOne({ email: "${anyUser.email}" })`, explain);
    console.log("  expected: IXSCAN, because email has a unique index (models/User.js)");
  } else {
    console.log("\nNo users found. Run: node scripts/seed.js");
  }

  // 2. find posts by author -- posts has a compound index on author + createdAt
  const anyPost = await Post.findOne();
  if (anyPost) {
    const explain = await Post.find({ author: anyPost.author })
      .sort({ createdAt: -1 })
      .explain("executionStats");
    report(`Post.find({ author: ObjectId }).sort({ createdAt: -1 })`, explain);
    console.log("  expected: IXSCAN, because of the compound index (models/Post.js)");
  } else {
    console.log("\nNo posts found. Run: node scripts/seed.js");
  }

  // 3. the same query WITHOUT an index, to show what COLLSCAN looks like
  console.log("\n--- For comparison: a query on a field with no index ---");
  const explain = await Post.find({ title: /MongoDB/i }).explain("executionStats");
  report('Post.find({ title: /MongoDB/i })', explain);
  console.log("  expected: COLLSCAN, because posts has no index on title");

  await mongoose.disconnect();
})().catch(async (e) => {
  console.error("Demo failed:", e.message);
  await mongoose.disconnect();
  process.exit(1);
});
