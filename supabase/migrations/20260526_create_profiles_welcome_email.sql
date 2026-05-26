-- Migration: create profiles table with welcome email tracking

create table public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  phone text null,
  role text not null default 'customer'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  avatar_url text null,
  is_first_login boolean not null default true,
  welcome_email_sent boolean not null default false,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (
        array[
          'customer'::text,
          'staff'::text,
          'admin'::text,
          'wholesale'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_profiles_role on public.profiles using btree (role) TABLESPACE pg_default;

create trigger trg_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION set_row_updated_at ();