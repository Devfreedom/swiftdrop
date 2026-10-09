# Blog API

A self-study project covering NoSQL, MongoDB and Redis. A small blog API built
with Node.js, Express, Mongoose and Redis.

See **[NOTES.md](NOTES.md)** for what each topic means, why it is used, when to
use it, and where it appears in the code. **[requests.http](requests.http)** has
ready-made requests for the VS Code REST Client.

## Features

- **Auth** - register, login, me, logout. Passwords hashed with bcrypt.
- **Posts CRUD** - create, read, update, delete. Posts reference an author, and
  `populate()` fills in the author's name and email.
- **Redis caching** - `GET /posts` is cached for 60 seconds and invalidated on
  any write. The response tells you which one served it (`"source": "db"` or
  `"source": "cache"`).
- **Sessions in Redis** - logged-in state survives a server restart.
- **Redis pub/sub** - creating a post publishes a `new-post` event, logged by a
  subscriber.
- **Rate limiting** - 100 requests per 15 minutes per IP, returns `429`.
- **Aggregation** - four stats routes using `$count`, `$group`, `$lookup`,
  `$unwind`, `$project`, `$sort`, `$match`, `$skip` and `$limit`.
- **Indexing** - unique index on email, compound index on author + createdAt,
  with an `explain()` demo showing IXSCAN vs COLLSCAN.

## Requirements

- Node.js 18+
- A running Redis on `localhost:6379`
- A MongoDB connection string (MongoDB Atlas is fine)

## Setup

```bash
npm install
```

Create a `.env` file:

```
MONGO_URI=mongodb+srv://...
SESSION_SECRET=some-long-random-string
```

Redis is configured in `config/redis.js`, defaulting to
`redis://127.0.0.1:6379`.

## Run

```bash
node scripts/seed.js      # optional: 4 users and 18 posts to play with
node server.js            # starts on http://localhost:3000
```

The seed script is safe to run more than once. It only replaces its own sample
data (emails ending in `@seed.example`), never anything else.

Seeded logins all use the password `password123`:

```
ada@seed.example
grace@seed.example
alan@seed.example
katherine@seed.example
```

## Endpoints

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/` | - | health check |
| POST | `/auth/register` | - | 400 on bad email or duplicate |
| POST | `/auth/login` | - | sets the session cookie |
| GET | `/auth/me` | yes | 401 if not logged in |
| POST | `/auth/logout` | - | destroys the session |
| GET | `/posts` | - | Redis cached, 60s TTL |
| GET | `/posts/:id` | - | `populate`s the author |
| POST | `/posts` | yes | clears cache, publishes event |
| PUT | `/posts/:id` | yes | clears cache |
| DELETE | `/posts/:id` | yes | clears cache |
| GET | `/stats/users-count` | - | `$count` |
| GET | `/stats/posts-per-user` | - | `$group` + `$lookup` |
| GET | `/stats/popular` | - | top 5 by likes, avg + total |
| GET | `/stats/search` | - | `?minLikes=&page=&limit=` |

## Demo script

A quick tour, with the command to run in a second terminal where noted.

```bash
node scripts/seed.js
node server.js
```

1. **Caching** - call `GET /posts` twice. First says `"source":"db"`, second
   says `"source":"cache"`. Check the key: `redis-cli TTL posts:all`.
2. **Invalidation** - create a post, then call `GET /posts` again. It says
   `"source":"db"` because the cache was cleared.
3. **Pub/sub** - the server terminal prints
   `New post event received: {...}` when you create a post.
4. **Validation** - register with `"email": "nope"` (400), then register the
   same real email twice (400, duplicate key).
5. **Populate** - `GET /posts/:id` returns the author object, not just an id.
6. **Aggregation** - try `GET /stats/popular`, then
   `GET /stats/search?minLikes=20&page=1&limit=3` and `page=2` to see
   pagination.
7. **Sessions** - log in, check `redis-cli --scan --pattern 'sess:*'`, then
   delete that key and call `GET /auth/me` again for a 401.
8. **Rate limiting** - set `LIMIT = 5` in `middleware/rateLimiter.js`, restart,
   run `redis-cli DEL "rate::1"`, then send `GET /posts` six times. The first
   five return 200, the sixth returns `{"error":"Too Many Requests"}`. Put
   `LIMIT` back to 100. Note the rate key may be `rate::1` or
   `rate:::ffff:127.0.0.1` depending on your machine; find it with
   `redis-cli --scan --pattern 'rate:*'`.
9. **Indexes** - `node scripts/index-demo.js`. Two queries use an index
   (1 document examined), one does not and examines every post.

## Project layout

```
server.js               wires Mongo, Redis, rate limiter, session, routes
config/redis.js         the shared Redis client
models/                 User (schema, validation, bcrypt hook), Post (ref, indexes)
middleware/             rate limiter (Redis INCR + EXPIRE)
routes/                 auth.js, posts.js, stats.js
scripts/                seed.js, index-demo.js
NOTES.md                topic-by-topic study notes
requests.http           REST Client requests
```
