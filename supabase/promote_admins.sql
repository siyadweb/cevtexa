-- Run this AFTER creating both users in Supabase Authentication > Users.
-- Passwords are never stored or handled here.

update public.profiles p
set role = case
  when lower(p.email) = 'cevtexa@gmail.com' then 'owner'
  when lower(p.email) = 'mziyad682@gmail.com' then 'admin'
  else p.role
end,
updated_at = now()
where lower(p.email) in ('cevtexa@gmail.com', 'mziyad682@gmail.com');

select email, role
from public.profiles
where lower(email) in ('cevtexa@gmail.com', 'mziyad682@gmail.com');
