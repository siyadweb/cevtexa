# CEVTEXA — Supabase Next Step

The existing CEVTEXA design is unchanged. This package now includes the Supabase foundation.

## On your computer

1. Open the project folder.
2. Run:

```bash
npm install
```

This will install the newly added `@supabase/supabase-js` dependency and refresh `package-lock.json`.

3. Create `.env.local` from `.env.example` and enter your Supabase Project URL and Publishable/anon key.

## In Supabase

Open **SQL Editor → New query** and run:

`supabase/migrations/202609270001_initial_cevtaxa_schema.sql`

This creates the database tables, indexes, RLS policies, grants, auth profile trigger, and storage buckets.

## Then

Run:

```bash
npm run build
npm run dev
```

The existing homepage should remain visually unchanged.

### Security

Never put a Supabase service-role key in `NEXT_PUBLIC_*` variables or client-side code. `.env.local` is ignored by git.
