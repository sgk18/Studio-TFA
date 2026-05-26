-- 20260526_admin_user_details_rpc.sql
-- Gets complete details for a single user in the admin panel

create or replace function public.get_admin_user_details(
  target_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  -- Ensure only admins can execute this
  if not public.has_role(array['admin']) then
    raise exception 'Unauthorized';
  end if;

  select json_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'role', p.role,
    'phone', p.phone,
    'default_shipping_address', p.default_shipping_address,
    'signup_date', p.created_at,
    'last_sign_in_at', au.last_sign_in_at,
    'banned_until', au.banned_until,
    'provider', au.raw_app_meta_data->>'provider',
    'providers', au.raw_app_meta_data->>'providers',
    'user_metadata', au.raw_user_meta_data,
    'order_count', coalesce((select count(*) from public.orders o where o.user_id = p.id), 0),
    'total_spend', coalesce((select sum(amount) from public.payment_events pe where pe.metadata->>'user_id' = p.id::text and pe.status = 'captured'), 0)
  ) into v_result
  from public.profiles p
  join auth.users au on p.id = au.id
  where p.id = target_user_id;

  return v_result;
end;
$$;

grant execute on function public.get_admin_user_details(uuid) to authenticated;
