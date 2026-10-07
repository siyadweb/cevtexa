# CEVTEXA Admin Setup

## 1. Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Never commit `.env.local` and never put a Supabase service-role key in client code.

## 2. Create admin users in Supabase

Supabase Dashboard → Authentication → Users → Add user → Create new user.

Create:
- cevtexa@gmail.com
- mziyad682@gmail.com

Set secure passwords privately in Supabase.

## 3. Assign roles

Run `supabase/promote_admins.sql` in Supabase SQL Editor after both users exist.

Roles:
- cevtexa@gmail.com → owner
- mziyad682@gmail.com → admin

## 4. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin/login`.

The dashboard is protected by Supabase Auth and checks the `profiles.role` value before allowing owner/admin access.

## Current admin foundation

- `/admin/login` — secure email/password login
- `/admin` — protected dashboard
- Dashboard metrics read from Supabase
- Sidebar navigation
- Sign out
- Protected module placeholders for Leads, Messages, Projects, Case Studies, Services, Blog, Testimonials, Team, Careers, Media, Pages/SEO and Settings

The next production module should be Leads/CRM. No fake data is created by the admin UI.
