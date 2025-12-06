-- Option 3 new tables
create table if not exists trending_topics(
  id bigserial primary key,
  keyword text not null,
  score numeric default 0,
  last_seen_at timestamptz default now()
);
create table if not exists job_queue(
  id bigserial primary key,
  type text not null,
  payload jsonb not null,
  status text default 'queued',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists api_metrics(
  id bigserial primary key,
  route text,
  latency_ms int,
  code int,
  created_at timestamptz default now()
);
create table if not exists audit_logs(
  id bigserial primary key,
  actor text,
  action text,
  subject text,
  meta jsonb,
  created_at timestamptz default now()
);
create table if not exists competitor_accounts(
  id bigserial primary key,
  handle text unique,
  last_viral_at timestamptz,
  avg_engagement numeric default 0
);
create table if not exists migration_history(
  id bigserial primary key,
  name text not null,
  applied_at timestamptz default now()
);
