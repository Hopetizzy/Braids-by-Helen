# Braids by Helen: Supabase Setup Guide

This guide explains how to set up the free Supabase backend for Braids by Helen.

---

## 1. Create a Supabase Project

1. Visit [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New Project**.
3. Name your project (e.g. `braids-by-helen`).
4. Set a strong database password and keep it safe.
5. Select the closest region (e.g. `eu-west-1` or `eu-central-1` for West Africa connectivity).
6. Click **Create new project** and wait about 2 minutes for provisioning to finish.

---

## 2. Execute SQL Migrations

1. In your Supabase dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Open `supabase/migrations/001_initial_schema.sql` in your local project, copy all lines, paste them into the SQL editor, and click **Run**.
4. Create another new query, copy all lines from `supabase/migrations/002_rls_policies.sql`, paste them into the SQL editor, and click **Run**.
5. Create a third query, copy all lines from `supabase/seed.sql`, paste them into the SQL editor, and click **Run**.

This provisions the tables (`services`, `bookings`, `availability`, `booking_status_history`, `media`, `business_settings`), enables Row Level Security, creates the `salon-media` storage bucket, installs the Policy B atomic conflict check function, and seeds the initial services.

---

## 3. Provision Helen's Administrator Account

1. In your Supabase dashboard, open **Authentication** -> **Users**.
2. Click **Add User** -> **Create user**.
3. Enter Helen's email address (for example `helen@braidsbyhelen.com`).
4. Set a strong administrator password.
5. Ensure **Auto Confirm User** is checked.
6. Click **Create user**.

> **Note**: Public user registrations are disabled by Row Level Security and client app settings. Clients do not need accounts to book appointments. Only Helen's account can view customer telephone numbers and change booking statuses.

---

## 4. Configure Local Environment Variables

1. In your Supabase dashboard, open **Project Settings** -> **API**.
2. Copy the **Project URL** and the **anon public API key**.
3. In your local project root, create a file named `.env` (or copy `.env.example` to `.env`).
4. Paste the credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

5. Restart the development server (`npm run dev`) or build for production (`npm run build`).

---

## 5. Offline Demo Fallback

If `.env` is omitted or invalid, the application automatically runs in offline demo mode:
- Active services fall back to local bundled data.
- Booking submissions succeed locally with confetti and unique `BBH-XXXX` references.
- Helen can sign in to the administrative dashboard using Demo Mode.
