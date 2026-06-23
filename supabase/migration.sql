-- Hermes Concierge — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Services catalog
create table if not exists services (
  id text primary key,
  name text not null,
  description text not null,
  price_cents integer not null,
  stripe_price_id text,
  estimated_minutes integer default 5,
  prompt_template text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Clients (extends Supabase auth.users)
create table if not exists clients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_customer_id text unique,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  service_id text references services(id),
  title text not null,
  brief text not null,
  context text,
  special_instructions text,
  status text default 'pending' check (status in ('pending','processing','complete','revision_requested','revision_processing','revision_complete','failed')),
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_cents integer not null,
  currency text default 'usd',
  -- Fulfillment
  fulfilled_content text,
  fulfilled_at timestamptz,
  delivered_file_path text,
  -- Revision
  revision_brief text,
  revision_content text,
  revision_requested_at timestamptz,
  revision_fulfilled_at timestamptz,
  -- MiniMax metadata
  minimax_tokens_used integer,
  minimax_model text default 'MiniMax-M3',
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent action log (full audit trail)
create table if not exists agent_actions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  action_type text not null,
  input_summary text,
  output_summary text,
  tokens_in integer,
  tokens_out integer,
  latency_ms integer,
  success boolean default true,
  error_message text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_orders_client_id on orders(client_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_agent_actions_order_id on agent_actions(order_id);

-- RLS
alter table clients enable row level security;
alter table orders enable row level security;
alter table agent_actions enable row level security;

drop policy if exists "clients_own_data" on clients;
create policy "clients_own_data" on clients
  for all using (id = auth.uid());

drop policy if exists "clients_own_orders" on orders;
create policy "clients_own_orders" on orders
  for all using (client_id = auth.uid());

drop policy if exists "clients_view_their_actions" on agent_actions;
create policy "clients_view_their_actions" on agent_actions
  for select using (
    order_id in (select id from orders where client_id = auth.uid())
  );

-- Service-role bypass: service role key bypasses RLS automatically

-- Seed services
insert into services (id, name, description, price_cents, estimated_minutes, prompt_template) values
('research-brief', 'Research Brief', 'Comprehensive research on any topic with key findings, data points, and actionable insights.', 900, 4, 'You are an expert researcher. Produce a comprehensive, well-structured research brief on the following topic. Include: Executive Summary, Key Findings (5-7 bullet points with data), Detailed Analysis (3-4 sections), Implications & Recommendations, and Sources to explore further. Be specific, insightful, and professional. Brief: {brief} Context: {context}'),
('copywriting', 'Copywriting', 'Persuasive, conversion-focused copy for landing pages, emails, ads, or product descriptions.', 1500, 5, 'You are a world-class copywriter. Create compelling, conversion-focused copy based on this brief. Match the tone, audience, and goals described. Deliver: Headline options (3), Subheadline, Body copy, CTA copy, and a brief rationale for your choices. Brief: {brief} Context: {context}'),
('data-analysis', 'Data Analysis', 'Structured analysis of data, trends, or metrics with clear findings and visual-ready summaries.', 1900, 6, 'You are a senior data analyst. Analyze the data or trends described and produce: Executive Summary, Methodology Note, Key Findings with quantitative support, Trend Analysis, Anomalies or Risks, and Strategic Recommendations. Be rigorous and precise. Brief: {brief} Context: {context}'),
('strategy-report', 'Strategy Report', 'In-depth strategic analysis, market assessment, or business planning document.', 2900, 8, 'You are a McKinsey-level strategy consultant. Produce a professional strategy report based on this brief. Include: Situation Assessment, Strategic Options (3), Recommended Direction with rationale, Implementation Roadmap (90-day), Key Risks and Mitigations, and Success Metrics. Brief: {brief} Context: {context}'),
('competitor-analysis', 'Competitor Analysis', 'Detailed breakdown of competitors, their positioning, strengths, weaknesses, and market gaps.', 2400, 7, 'You are a competitive intelligence expert. Produce a thorough competitor analysis. Include: Market Landscape Overview, Competitor Profiles (identify from brief, analyze each), Feature/Positioning Comparison Matrix, Identified Market Gaps, Strategic Opportunities, and Recommendations. Brief: {brief} Context: {context}')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  estimated_minutes = excluded.estimated_minutes,
  prompt_template = excluded.prompt_template,
  active = true;

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- Done. Verify:
select id, name, price_cents, active from services order by price_cents;
