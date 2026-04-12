-- Studio TFA: wholesale role + pricing policy upgrade

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'staff', 'admin', 'wholesale'));
