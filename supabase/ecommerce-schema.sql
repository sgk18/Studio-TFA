-- Studio TFA e-commerce base schema
-- Tables: products, profiles, orders, reviews, returns
-- Includes row-level security policies for guest and authenticated flows.

create extension if not exists pgcrypto;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_role(role_names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = any(role_names)
  );
$$;

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique,
  description text,
  category text not null default 'general',
  image_url text,
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_slug on public.products(slug);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_row_updated_at();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_row_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

create table if not exists public.orders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'cancelled', 'failed', 'refunded')),
  currency text not null default 'INR',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  premium_gifting_fee numeric(12,2) not null default 0 check (premium_gifting_fee >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  promo_code text,
  payment_provider text not null default 'razorpay',
  payment_status text not null default 'created' check (payment_status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  payment_reference text,
  shipping_address jsonb not null,
  line_items jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_identity_check check (user_id is not null or guest_email is not null)
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_row_updated_at();

create table if not exists public.reviews (
  id text primary key default gen_random_uuid()::text,
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_row_updated_at();

create table if not exists public.returns (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'completed')),
  refund_amount numeric(12,2) check (refund_amount is null or refund_amount >= 0),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_returns_order_id on public.returns(order_id);
create index if not exists idx_returns_user_id on public.returns(user_id);

drop trigger if exists trg_returns_updated_at on public.returns;
create trigger trg_returns_updated_at
before update on public.returns
for each row
execute function public.set_row_updated_at();

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.returns enable row level security;

-- products policies
drop policy if exists products_read_active on public.products;
create policy products_read_active
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists products_manage_admin on public.products;
create policy products_manage_admin
on public.products
for all
to authenticated
using (public.has_role(array['admin', 'staff']))
with check (public.has_role(array['admin', 'staff']));

-- profiles policies
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.has_role(array['admin', 'staff']));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.has_role(array['admin', 'staff']))
with check (id = auth.uid() or public.has_role(array['admin', 'staff']));

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.has_role(array['admin', 'staff']));

-- orders policies
drop policy if exists orders_insert_guest on public.orders;
create policy orders_insert_guest
on public.orders
for insert
to anon
with check (
  user_id is null
  and guest_email is not null
  and length(trim(guest_email)) > 0
);

drop policy if exists orders_insert_authenticated on public.orders;
create policy orders_insert_authenticated
on public.orders
for insert
to authenticated
with check (
  user_id = auth.uid()
  or (user_id is null and guest_email is not null and length(trim(guest_email)) > 0)
);

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.has_role(array['admin', 'staff']));

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin
on public.orders
for update
to authenticated
using (public.has_role(array['admin', 'staff']))
with check (public.has_role(array['admin', 'staff']));

-- reviews policies
drop policy if exists reviews_read_all on public.reviews;
create policy reviews_read_all
on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists reviews_insert_self on public.reviews;
create policy reviews_insert_self
on public.reviews
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists reviews_update_self on public.reviews;
create policy reviews_update_self
on public.reviews
for update
to authenticated
using (user_id = auth.uid() or public.has_role(array['admin', 'staff']))
with check (user_id = auth.uid() or public.has_role(array['admin', 'staff']));

drop policy if exists reviews_delete_self on public.reviews;
create policy reviews_delete_self
on public.reviews
for delete
to authenticated
using (user_id = auth.uid() or public.has_role(array['admin', 'staff']));

-- returns policies
drop policy if exists returns_insert_own on public.returns;
create policy returns_insert_own
on public.returns
for insert
to authenticated
with check (user_id = auth.uid() or public.has_role(array['admin', 'staff']));

drop policy if exists returns_select_own on public.returns;
create policy returns_select_own
on public.returns
for select
to authenticated
using (user_id = auth.uid() or public.has_role(array['admin', 'staff']));

drop policy if exists returns_update_admin on public.returns;
create policy returns_update_admin
on public.returns
for update
to authenticated
using (public.has_role(array['admin', 'staff']))
with check (public.has_role(array['admin', 'staff']));
