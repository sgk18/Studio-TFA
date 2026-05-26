-- 20260526_admin_users_rpc.sql
-- Creates an RPC for admins to fetch users securely, joining profiles and auth.users

create or replace function public.get_admin_users(
  search_query text default null,
  role_filter text default null,
  status_filter text default null,
  provider_filter text default null,
  page_limit int default 10,
  page_offset int default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  signup_date timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  provider text,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Ensure only admins can execute this
  if not public.has_role(array['admin']) then
    raise exception 'Unauthorized';
  end if;

  return query
  with filtered as (
    select
      p.id,
      p.email,
      p.full_name,
      p.role,
      p.created_at as signup_date,
      au.last_sign_in_at,
      au.banned_until,
      (au.raw_app_meta_data->>'provider')::text as provider
    from public.profiles p
    join auth.users au on p.id = au.id
    where (search_query is null or p.email ilike '%' || search_query || '%' or p.full_name ilike '%' || search_query || '%' or p.id::text ilike '%' || search_query || '%')
      and (role_filter is null or role_filter = 'all' or p.role = role_filter)
      and (status_filter is null or status_filter = 'all' or 
           (status_filter = 'active' and (au.banned_until is null or au.banned_until < now())) or 
           (status_filter = 'disabled' and au.banned_until > now()))
      and (provider_filter is null or provider_filter = 'all' or (au.raw_app_meta_data->>'provider')::text = provider_filter)
  )
  select 
    f.id, f.email, f.full_name, f.role, f.signup_date, f.last_sign_in_at, f.banned_until, f.provider,
    (select count(*) from filtered)::bigint as total_count
  from filtered f
  order by f.signup_date desc
  limit page_limit
  offset page_offset;
end;
$$;

-- Ensure the function is accessible to authenticated users
-- The internal check `public.has_role` will ensure only admins can actually use it
grant execute on function public.get_admin_users(text, text, text, text, int, int) to authenticated;
