# CEVTEXA Supabase Setup

## 1. Environment
Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase publishable/anon key)

Never put a service-role key in client-side code.

## 2. Apply the database migration
Open Supabase Dashboard → SQL Editor → New query.

Run the complete file:

`supabase/migrations/202609270001_initial_cevtaxa_schema.sql`

It creates the CEVTEXA schema, indexes, triggers, auth profile trigger, RLS policies, grants, and storage buckets.

## 3. Verify
In Supabase Table Editor, confirm the public tables exist.
In Storage, confirm:
- site-media
- blog
- projects
- team
- careers

Do not add production content yet.
