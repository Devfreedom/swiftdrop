# Blog API - Study Notes

Plain-English notes for every NoSQL / MongoDB / Redis topic in this project.
Each section answers four questions: **what is it**, **why we use it**, **when
should you use it**, and **where does it appear in this project**.

---

## 1. Embedding vs Referencing

**What is it**
SQL tables have a fixed shape, so one table points to another with a foreign
key. MongoDB stores whole JSON-like documents, so you have two ways to connect
data:

- **Embedding** = put the data *inside* the same document, as a nested array or
  nested object.
- **Referencing** = store only an id in the document, and keep the real data in
  another collection. That id is called a `ref`.

**Why we use it**
Because MongoDB has no joins. The database cannot merge two collections for
you in a normal query. So you must decide up front how the pieces are linked.
Embedding means one read gets everything. Referencing means you need a second
read.

**When to use which**
Use **embedding** when the child data belongs to the parent and is always read
with it, and there is only a small amount of it. A good sign: it is "one-to-few"
or "one-to-many, and bounded". Blog comments for a post are a classic example.

Use **referencing** when the data is shared, when there could be a lot of it, or
when the two things have an independent life. Also use it when one document
could grow past the 16 MB document limit. A post has exactly one author, and an
author may have many posts, so referencing fits.

A rough rule: "one to many" tends toward embedding. "Many to many" tends toward
referencing.

**Where in this project**
`models/Post.js` uses referencing:

```js
author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
```

The post document only stores the author's id. To get the author's name, the
code asks Mongoose to fill it in, which is called **populate** (`routes/posts.js`
lines 15 and 22 use `.populate("author", "name email")`).

A mistake to avoid: embedding both sides at once. If `User` also stored the
full list of post bodies, and `Post` stored the full user document, the same
data would be copied in two places and the two copies could disagree. Keeping
the real data in one place and linking by id avoids that.

---

## 2. Mongoose: Schema, Validation, Hooks, Populate

Mongoose is a layer that sits between your JavaScript and MongoDB. MongoDB
itself will happily store anything. Mongoose gives your code structure,
rules, and safety.

### Schema

**What** - a JavaScript description of what a document should look like:
which fields exist, what type each one is, and what is required.

**Why** - Without a schema, a typo like `titel` would silently create a second,
empty field. The schema is your contract with the database.

**When** - Always, for every collection.

**Where** - `models/User.js` and `models/Post.js`. Note the type reference used
for a link:

```js
mongoose.Schema.Types.ObjectId
```

`{ timestamps: true }` adds `createdAt` and `updatedAt` automatically. Both
models use it.

### Validation

**What** - rules that reject bad data before it is saved. `required: true`,
`minlength`, a custom `validator` function, and so on.

**Why** - Bad data that gets in is expensive to remove later. Checking at the
door is cheap.

**When** - For anything a user types in, especially email addresses, passwords,
and numbers.

**Where** - `models/User.js`:

- `email` is `required`, `unique`, and `lowercase`.
- `email` has a custom validator using a regular expression:
  `/^\S+@\S+\.\S+$/` - a rough "looks like an email" check.
- `password` has `minlength: 6`.

Note that regular expression only checks the *shape*. It does not prove the
mailbox exists. For a real project you would send a confirmation email.

Also note: schema validation is only applied on `save()` and `create()`. On
`update` queries you must turn it on yourself with `runValidators: true`.
`routes/posts.js` does exactly that on the PUT route. Forget that flag and you
can write invalid data straight into the database.

### Hooks (middleware)

**What** - a function Mongoose automatically runs at a moment in a
document's life, such as before it is saved or after it is validated. Mongoose
hooks have the same idea as Express middleware.

**Why** - To do work you must not forget to do yourself every single time. Here,
hashing a password. If you hashed it manually in every route you would
eventually forget one, and you would store a plaintext password in your
database.

**When** - For work that must happen every time, no exceptions: hashing
passwords, normalising data, logging changes.

**Where** - `models/User.js`:

```js
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
```

`pre("save")` runs before saving. `isModified("password")` is important: it
means only hash again when the password actually changed. Without that check,
every unrelated profile update would re-hash an already-hashed string and the
user could no longer log in.

`10` is the bcrypt cost factor: the number of times the hash is repeated. It
makes guessing passwords deliberately slow for an attacker while staying fast
enough for a real login.

Login then reverses this using `bcrypt.compare`, which can tell whether a
plain password matches a hash. It cannot "un-hash" it (`routes/auth.js`
line 16).

**Danger of hooks:** they run on `save()` and `create()`, but **not** on
`insertMany()`. `scripts/seed.js` uses `User.create()` so the hook runs and the
passwords get hashed, but uses `Post.insertMany()` for the posts because posts
have no password hook and it is much faster. If you ever bulk-insert users with
`insertMany()`, your passwords would be stored in plain text.

### Populate

**What** - takes a field holding a `ref`, runs a second query to fetch the
referenced document, and attaches it in place of the bare id.

**Why** - Convenience. Without it you would get `{ author: "6ac8..." }`, which
is useless on its own. With it you get the author's name and email in the same
response.

**When** - Whenever the client needs data from a referenced collection. But do
not use it automatically everywhere. `populate` is an extra database query, and
on a big collection that extra query is a real cost.

**Where** - `routes/posts.js`:

```js
Post.find().populate("author", "name email")
```

The second argument limits which fields come back. Without it you would send
the author's hashed password to the client, which would be a serious security
bug.

Notice that `GET /posts` uses `populate`, but the aggregation route
`routes/stats.js` (`/posts-per-user`) does not, because the aggregation
pipeline already joins the data using `$lookup`. Two different tools for the
same job: `populate` for normal queries, `$lookup` inside a pipeline.

---

## 3. Aggregation Stages

**What** - An aggregation pipeline is a list of steps that documents flow
through, like an assembly line. Each step transforms the documents and passes
them to the next step. You build it as an array of objects:

```js
Model.aggregate([{ $stage: ... }, { $stage: ... }])
```

The order matters. Data goes through the stages top to bottom, and it is often
much faster to filter early so later stages work on less data.

**Why** - It is how you do calculations and joins that a normal `find()` cannot
do. Counting, grouping, averaging, joining collections, paginating.

**When** - Reporting and statistics pages, anything with counting or grouping.

**Where** - all four routes in `routes/stats.js`.

### `$count` - how many documents match

```js
User.aggregate([{ $count: "total" }])
```
Returns one document like `{ total: 6 }`. If nothing matches you get no
documents at all, which is why the route falls back to `{ total: 0 }`.

### `$group` - collapse many documents into buckets

```js
{ $group: { _id: "$author", totalPosts: { $sum: 1 } } }
```
Groups every post by its author id and counts them. The `_id` field of a
`$group` is the thing you are grouping by, so that is where the author id goes.

Other accumulators you can use: `$sum`, `$avg`, `$min`, `$max`.

### `$lookup` - join another collection

```js
{ $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } }
```
This is the MongoDB equivalent of a SQL join. It reads like a sentence:
"from the users collection, where users._id equals this group's _id, put the
result in a field called user".

One thing to know: the `from` value is the **collection name**, which is the
model name pluralised and lowercased, not the file name. So `"users"` and
`"posts"`, not `"User"` and `"Post"`.

`as: "user"` wraps the result in an **array**, because one group id could
match several documents. That is why the next stage exists.

### `$unwind` - flatten an array into separate documents

```js
{ $unwind: "$user" }
```
Takes the array from `$lookup` and turns each entry into its own document, so
`user` is now a plain object instead of an array. Usually used right after a
`$lookup`.

Careful: `$unwind` also **drops** documents where the array was empty. In this
project that means posts whose author id matches no user would silently
disappear from the result. Acceptable here, but worth knowing.

### `$project` - choose which fields to return

```js
{ $project: { _id: 0, name: "$user.name", email: "$user.email", totalPosts: 1 } }
```
Shapes the output. `1` means include the field, `0` means leave it out.
`{ _id: 0, ... }` removes the auto id.

Use it at the end so you do not ship fields you do not need. In the `$lookup`
result, `name` was inside `user`, so you reach in with `"$user.name"`.

### `$sort` and `$limit`

```js
{ $sort: { likes: -1 } },   // -1 is descending: most likes first
{ $limit: 5 }               // keep only the top 5
```
Sorting then limiting is how you get a "top N" list. Limit them to as few
documents as possible for speed.

### `$match`, `$skip`, `$limit` - searching and pagination

`GET /stats/search?minLikes=1&page=1&limit=5`:

```js
{ $match: { likes: { $gte: minLikes } } },  // filter: likes >= minLikes
{ $sort: { likes: -1, createdAt: -1 } },     // best first
{ $skip: (page - 1) * limit },               // jump past earlier pages
{ $limit: limit },                           // take just this page
```

Pagination with `$skip` and `$limit` is the standard pattern. For page 1 you
skip 0, page 2 you skip `limit`, page 3 you skip `2 * limit`. The arithmetic is
`(page - 1) * limit`.

Two honest limitations of `$skip`: the database still has to walk past all the
skipped documents, so deep pages get slower and slower. And if someone inserts
a new post while you are on page 3, a document can appear on two pages or on
none. A production system with large collections uses a cursor instead, based
on the last `createdAt` you saw. For a study project, `$skip` is fine and much
easier to explain.

The route also runs a second small pipeline with just `$match` and `$count` to
get the total number of matches, so a client can work out how many pages exist.
Two pipelines, but the second one is cheap because it returns a single number.

The route clamps its inputs so a user cannot send nonsense:

```js
const page  = Math.max(Number(req.query.page) || 1, 1);       // at least 1
const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 50); // 1 to 50
```

Without the cap on `limit`, a request for `?limit=1000000` would try to build a
huge response and could crash the server.

---

## 4. Indexing

**What** - Without an index, MongoDB reads a document collection one document
at a time from the beginning until it finds what it needs. That is a
**collection scan** (COLLSCAN). An index is a separate, sorted structure that
holds only the indexed fields plus a pointer back to the document, so MongoDB
can jump straight to the right place. That is an **index scan** (IXSCAN).

The cost: an index is not free. Every insert, update, and delete must also
update the index, and indexes use disk space.

**Why** - Because reading every document gets slower and slower as the
collection grows. An index turns "read everything" into "read a few".

**When** - Index the fields you actually query, filter, sort, or join on. Do not
index everything: each extra index is extra write cost and extra memory, and an
unused index is pure waste.

In this project:
- `users.email` is **unique**, which creates a unique index. This makes both
  the login lookup fast and "no two users with the same email" a rule enforced
  by the database itself (`models/User.js`).
- `posts` has a **compound index** on `{ author: 1, createdAt: -1 }`
  (`models/Post.js`). It serves two needs at once: find posts by author, and
  sort them newest first, in one lookup.

**Where** - Declared in `models/User.js` (`unique: true`) and `models/Post.js`
(`postSchema.index(...)`). Demonstrated by `scripts/index-demo.js`.

### How to see which one you get

`explain("executionStats")` asks MongoDB "what were you actually doing?". Look
at three things:

- `winningPlan` - the plan MongoDB chose. `IXSCAN` means an index was used,
  `COLLSCAN` means it read everything.
- `totalDocsExamined` - how many documents it had to open. This is the number
  to watch. If it equals the size of the collection, you have a problem.
- `executionTimeMillis` - how long it took.

Compare that with `nReturned`: when `docsExamined` is close to `nReturned`, the
index did its job. When `docsExamined` is much larger, the index is not helping.

In MongoDB 7+ some plans are wrapped, so the stage may read `EXPRESS_IXSCAN`
instead of plain `IXSCAN`. Same meaning, still an index being used.
`scripts/index-demo.js` handles this by checking whether any stage name
*contains* `IXSCAN`.

Run the demo and you should see:

| Query | Plan | docsExamined |
|---|---|---|
| `User.findOne({ email })` | IXSCAN | 1 |
| `Post.find({ author }).sort({ createdAt: -1 })` | IXSCAN | 1 |
| `Post.find({ title: /MongoDB/i })` | COLLSCAN | every post |

The third query is the point of the exercise: there is no index on `title`, so
MongoDB has to read all the posts to find 2 matches. That is what a missing
index looks like.

---

## 5. Redis Caching (hit, miss, invalidation)

**What** - A cache keeps an expensive result somewhere fast so you do not
recompute it. Here the expensive thing is a MongoDB query, and the fast place
is Redis, which keeps data in memory.

**Why** - Databases are the slow part of most web apps. If many people ask for
the same list of posts at the same time, you can answer almost all of them from
memory instead of hitting MongoDB every time.

**When** - When the data is read far more often than it changes. Posts are a
good example: lots of readers, few writes.

**How it works here** - `GET /posts` in `routes/posts.js`:

```js
const cached = await redis.get("posts:all");          // look in Redis
if (cached) {
  return res.json({ source: "cache", data: JSON.parse(cached) });
}

const posts = await Post.find().populate("author", "name email");
await redis.set("posts:all", JSON.stringify(posts), { EX: 60 });
res.json({ source: "db", data: posts });
```

Three states:

- **Cache MISS** - the key is not in Redis, so we query MongoDB, store the
  answer in Redis with a 60 second expiry, and return `source: "db"`.
- **Cache HIT** - the key is in Redis, so we return it immediately without
  touching MongoDB, and respond with `source: "cache"`.
- **Invalidation** - the cached copy is now out of date, so we delete it.

Two things make this work correctly:

1. **The `source` field in the response.** It is there purely so you can *see*
   which happened. Call `GET /posts` twice quickly and watch it flip from `db`
   to `cache`. That is the single best way to demonstrate caching to your
   class.

2. **The expiry, `EX: 60`.** The cache empties itself after 60 seconds. This is
   a safety net, not the main strategy. It means that even if some
   invalidation is missed somewhere, users never see stale data for longer than
   a minute.

**Invalidation** happens on every write, because writes are what make cached
data wrong. In `routes/posts.js`, the create, update, and delete routes all run:

```js
await redis.del("posts:all");
```

This is called the **cache-aside** pattern: read from the cache, fall back to
the database, write back to the cache, and delete the cache on any change.

The honest downside: if you forget a `del` somewhere, users see old data until
the 60 second expiry saves you. That is why the TTL is short. For a single
server a short TTL is fine. For several servers at once, several of them can
write to Redis at the same time, so this approach starts to break and you need
something smarter. Worth mentioning if anyone asks.

You can watch Redis directly:

```
redis-cli GET posts:all     # the cached JSON
redis-cli TTL posts:all     # seconds left, counts down from 60
redis-cli --scan --pattern 'posts:*'
```

---

## 6. Sessions in Redis

**What** - Logging in means remembering who you are across many separate HTTP
requests. HTTP is stateless: each request stands alone, with no memory of the
last one. A **session** solves this by giving the user a cookie holding a
session id, and storing the actual session data on the server under that id.

**Why** - So the user does not have to send their password on every single
request. The cookie is a reference, not a secret.

**How it works here** - `server.js` configures `express-session` with a
Redis-backed store:

```js
const session = require("express-session");
const { RedisStore } = require("connect-redis");

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30, httpOnly: true },
}));
```

The `store` option is the important part. By default, `express-session` keeps
sessions in memory inside the Node process. That is bad for two reasons:
sessions are lost when the server restarts, and if you ever run two servers
they do not know about each other's sessions. Putting sessions in Redis fixes
both, and it is also fast.

**What the settings mean:**

- `secret` - used to sign the session cookie so it cannot be tampered with.
  It comes from `.env` (`SESSION_SECRET`), never hard-coded.
- `resave: false` - do not save the session again if nothing changed. Saves
  pointless writes to Redis.
- `saveUninitialized: false` - do not create a session for every visitor. Only
  create one when something is actually stored in it. Without this you would
  fill Redis with empty sessions for bots and crawlers.
- `httpOnly: true` - JavaScript cannot read the cookie. This is what protects
  against XSS stealing the session.
- `maxAge: 1000 * 60 * 30` - the cookie expires after 30 minutes.

**The flow**, across three routes in `routes/auth.js`:

1. `POST /auth/login` - check the password with `bcrypt.compare`, then
   `req.session.userId = user._id;`. That assignment is what makes
   `express-session` write a session to Redis and send back a `connect.sid`
   cookie. The server responds with `{"message":"Logged in"}`.
2. `GET /auth/me` - reads `req.session.userId`. `express-session` reads the
   cookie, looks the id up in Redis, and attaches the data to `req.session`.
   That is the whole reason Redis is involved.
3. `POST /auth/logout` - `req.session.destroy(...)` deletes the session from
   Redis.

**How to prove it is really in Redis:**

```
redis-cli --scan --pattern 'sess:*'
redis-cli GET "sess:<the id from the cookie>"
```

The key starts with `sess:`. If you delete it by hand, the next `/auth/me`
request fails with 401 even though the browser still has the cookie. That is a
good demonstration that the server, not the browser, is the source of truth.

**Authorisation, not authentication.** `GET /auth/me` only proves who you are.
Deciding what you may do happens in `routes/posts.js`:

```js
const requireLogin = (req, res, next) =>
  req.session.userId ? next() : res.status(401).json({ error: "Login required" });
```

This is a middleware, and it is attached only to the routes that need it
(create, update, delete). Reading posts stays open to everyone; changing them
needs a session. That is a deliberate and realistic split, because a blog
should be readable without logging in.

---

## 7. Redis Pub/Sub

**What** - Publish/Subscribe is one-to-many messaging. A **publisher** sends a
message to a named channel. Any number of **subscribers** listen on that
channel and get a copy. The publisher does not know or care who they are.

**Why** - To let one part of the system tell other parts that something
happened, without the two parts depending on each other. A new post is
created in one service, and something else might care: a notification service,
a search indexer, an email sender.

**How it works here**

Publish, in `routes/posts.js` on create:

```js
await redis.publish("new-post", JSON.stringify({ id: post._id, title: post.title }));
```

Subscribe, in `server.js`:

```js
const subscriber = redis.duplicate();   // a subscriber needs its own connection
await subscriber.connect();
await subscriber.subscribe("new-post", (message) => {
  console.log("New post event received:", JSON.parse(message));
});
```

**The important detail, and the most common mistake:** `redis.duplicate()`
creates a brand new client. A Redis connection that is in subscriber mode
**cannot run normal commands** any more. So you need two connections: the
normal one for `get`, `set`, `incr`, and the subscriber one, which only listens.
Trying to subscribe on your main client breaks all your caching, silently at
first. This is why the comment in `server.js` says "a subscriber needs its own
connection".

**How to see it:** create a post and watch the server terminal. You should see:

```
New post event received: { id: '6ac8...', title: 'My First Post' }
```

The JSON string is `JSON.parse`d in the subscriber so it prints as a readable
object instead of a raw string.

**The honest limitation:** messages are **not stored**. If no subscriber is
listening at that moment, the message is gone forever. That is fine for a
live "something happened" ping like this one, but it means Pub/Sub cannot be
used to build a queue that must not lose messages. For that you would need
Redis Streams or a real message broker.

---

## 8. Rate Limiting

**What** - A rate limiter caps how many requests one client may send in a time
window. Go over the cap and the server replies `429 Too Many Requests`.

**Why** - Mainly security and cost control. It stops:

- A brute-force attacker trying thousands of passwords on `/auth/login`.
- One client flooding the server and starving everybody else.
- Accidental bugs, such as a loop that calls your API a million times.

**How it works here** - `middleware/rateLimiter.js`:

```js
const LIMIT = 100;          // max requests
const WINDOW = 15 * 60;     // 15 minutes, in seconds

const count = await redis.incr(key);              // add 1
if (count === 1) await redis.expire(key, WINDOW);  // start the timer

if (count > LIMIT) return res.status(429).json({ error: "Too Many Requests" });
next();
```

Step by step:

1. The key is built from the client's IP: `` `rate:${req.ip}` ``. So every
   client gets their own counter.
2. `INCR` adds 1 to the counter and returns the new value. If the key did not
   exist, Redis creates it with a value of 1.
3. **Only on the very first request** (`count === 1`) do we set the expiry.
   This is the crucial detail: a sliding window would let a determined client
   keep their counter alive forever by trickling requests. This way the window
   starts once and always ends 15 minutes later.
4. Over the limit, return `429` with a JSON error and stop. Otherwise call
   `next()` to carry on to the next middleware.

**Why use Redis for the counter, rather than an array in memory?** Because the
count has to be shared and it has to survive a restart. Memory dies with the
process and is not shared between processes. Redis is fast, shared, and
persistent, so several app servers can all enforce the same limit. This is the
same reasoning as sessions in Redis, and the same `redis` client is reused.

**Where in this project** - `middleware/rateLimiter.js`, mounted in
`server.js` after `redis.connect()` and before the session and the routes:

```js
app.use(rateLimiter);
```

The order matters. It must come after `redis.connect()`, or `redis.incr` would
fail on a client that is not ready yet. It must come before your routes, or it
would never run.

**Two things to be careful about when explaining this:**

1. **The root route `/` is registered before the limiter**, at the top of
   `server.js`. Express matches routes in the order they were registered, so
   `GET /` never reaches the rate limiter. Test the limiter with `/posts` or
   `/stats`, not `/`.
2. **The Redis key name depends on your machine.** It is built from `req.ip`,
   which may be `::1` (IPv6) or `::ffff:127.0.0.1` (IPv4). Always find it with
   `redis-cli --scan --pattern "rate:*"` instead of guessing.

**To test it:** set `LIMIT` to 5 in `middleware/rateLimiter.js`, restart, delete
the counter with `redis-cli DEL "rate::<your-ip>"`, then send `GET /posts` six
times. The first five return `200`, the sixth returns:

```json
{"error":"Too Many Requests"}
```

Put `LIMIT` back to 100 afterwards.

**Real-world note:** this is a fixed window, and fixed windows have a known flaw.
A client can send 100 requests at 14:59 and 100 more at 15:01, so 200 requests
can get through in two seconds at the boundary. Fixing it properly means a
sliding window log or a token bucket, usually with sorted sets in Redis. For a
study project, the fixed window is the right amount of complexity.

---

## Quick file map

| File | What it shows |
|---|---|
| `server.js` | Wires everything together: Mongo, Redis, rate limiter, session, routes |
| `config/redis.js` | Creates the shared Redis client |
| `models/User.js` | Schema, validation, unique index, bcrypt pre-save hook |
| `models/Post.js` | `ref` to User, compound index |
| `middleware/rateLimiter.js` | Redis INCR + EXPIRE fixed-window rate limiting |
| `routes/auth.js` | Register, login, me, logout using sessions in Redis |
| `routes/posts.js` | CRUD, `populate`, Redis caching + invalidation, `publish` |
| `routes/stats.js` | `$count`, `$group`, `$lookup`, `$unwind`, `$project`, `$sort`, `$match`, `$skip`, `$limit` |
| `scripts/seed.js` | Safe-to-re-run sample data (`node scripts/seed.js`) |
| `scripts/index-demo.js` | `explain()` output, IXSCAN vs COLLSCAN (`node scripts/index-demo.js`) |
| `requests.http` | Ready-made requests for the VS Code REST Client |
