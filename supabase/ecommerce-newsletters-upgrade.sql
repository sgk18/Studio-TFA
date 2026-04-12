-- Studio TFA: newsletter subscribers table and policies

create table if not exists public.newsletter_subscribers (
  id text primary key default gen_random_uuid()::text,
  email text not null unique,
  source text not null default 'popup',
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  metadata jsonb not null default '{}'::jsonb,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_newsletter_subscribers_status
  on public.newsletter_subscribers(status);

create index if not exists idx_newsletter_subscribers_subscribed_at
  on public.newsletter_subscribers(subscribed_at desc);

drop trigger if exists trg_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger trg_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.set_row_updated_at();

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_subscribers_insert_public on public.newsletter_subscribers;
create policy newsletter_subscribers_insert_public
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (
  length(trim(email)) > 4
  and status = 'subscribed'
);

drop policy if exists newsletter_subscribers_select_admin on public.newsletter_subscribers;
create policy newsletter_subscribers_select_admin
on public.newsletter_subscribers
for select
to authenticated
using (public.has_role(array['admin', 'staff']));

drop policy if exists newsletter_subscribers_update_admin on public.newsletter_subscribers;
create policy newsletter_subscribers_update_admin
on public.newsletter_subscribers
for update
to authenticated
using (public.has_role(array['admin', 'staff']))
with check (public.has_role(array['admin', 'staff']));
