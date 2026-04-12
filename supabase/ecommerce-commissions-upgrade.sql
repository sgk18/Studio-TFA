-- Studio TFA: commissions + artist custom orders upgrades

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

create table if not exists public.custom_orders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  vision text not null,
  color_palette text[] not null default '{}'::text[],
  palette_notes text,
  reference_image_path text,
  reference_image_url text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'shipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_orders_status
  on public.custom_orders(status);

create index if not exists idx_custom_orders_created_at
  on public.custom_orders(created_at desc);

create index if not exists idx_custom_orders_user_id
  on public.custom_orders(user_id);

drop trigger if exists trg_custom_orders_updated_at on public.custom_orders;
create trigger trg_custom_orders_updated_at
before update on public.custom_orders
for each row
execute function public.set_row_updated_at();

alter table public.custom_orders enable row level security;

drop policy if exists custom_orders_insert_guest on public.custom_orders;
create policy custom_orders_insert_guest
on public.custom_orders
for insert
to anon
with check (
  user_id is null
  and length(trim(email)) > 0
  and length(trim(full_name)) > 0
  and length(trim(vision)) > 0
);

drop policy if exists custom_orders_insert_authenticated on public.custom_orders;
create policy custom_orders_insert_authenticated
on public.custom_orders
for insert
to authenticated
with check (
  user_id = auth.uid()
  or (
    user_id is null
    and length(trim(email)) > 0
    and length(trim(full_name)) > 0
    and length(trim(vision)) > 0
  )
);

drop policy if exists custom_orders_select_own on public.custom_orders;
create policy custom_orders_select_own
on public.custom_orders
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_role(array['admin', 'staff'])
);

drop policy if exists custom_orders_update_admin on public.custom_orders;
create policy custom_orders_update_admin
on public.custom_orders
for update
to authenticated
using (public.has_role(array['admin', 'staff']))
with check (public.has_role(array['admin', 'staff']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-order-references',
  'custom-order-references',
  true,
  10485760,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/heic'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists custom_order_reference_insert on storage.objects;
create policy custom_order_reference_insert
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'custom-order-references');

drop policy if exists custom_order_reference_read on storage.objects;
create policy custom_order_reference_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'custom-order-references');

drop policy if exists custom_order_reference_update_admin on storage.objects;
create policy custom_order_reference_update_admin
on storage.objects
for update
to authenticated
using (
  bucket_id = 'custom-order-references'
  and public.has_role(array['admin', 'staff'])
)
with check (
  bucket_id = 'custom-order-references'
  and public.has_role(array['admin', 'staff'])
);

drop policy if exists custom_order_reference_delete_admin on storage.objects;
create policy custom_order_reference_delete_admin
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'custom-order-references'
  and public.has_role(array['admin', 'staff'])
);
