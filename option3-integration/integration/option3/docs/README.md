# PROFITHACK AI — Option 3 Hybrid Integration
Merge steps:
1) Copy `integration/option3/server/lib/*.js` into your server lib folder.
2) Mount routes (health, trending, analytics, jobs, competitors, privacy) in your Express app.
3) Run SQL `integration/option3/sql/001_option3.sql` on PostgreSQL.
4) Add env from `integration/option3/.env.example`.
5) Start BullMQ worker: `node integration/option3/workers/queue.js`.
