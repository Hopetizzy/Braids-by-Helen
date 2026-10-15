-- Migration 005: Web Push Subscriptions and Notification Logs
-- Enables Helen to receive background mobile Web Push alerts for new salon bookings

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_name text default 'Helen Mobile Device',
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_notified_at timestamptz
);

create index if not exists idx_push_subscriptions_active on public.push_subscriptions(is_active);
create index if not exists idx_push_subscriptions_endpoint on public.push_subscriptions(endpoint);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.push_subscriptions(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  event_type text not null,
  title text not null,
  body text not null,
  status text not null default 'sent',
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_logs_booking on public.notification_logs(booking_id);
create index if not exists idx_notification_logs_created on public.notification_logs(created_at desc);

-- Enable Row Level Security
alter table public.push_subscriptions enable row level security;
alter table public.notification_logs enable row level security;

-- Policies for push_subscriptions
drop policy if exists "Allow public anonymous subscription registration" on public.push_subscriptions;
create policy "Allow public anonymous subscription registration"
  on public.push_subscriptions for insert
  with check (true);

drop policy if exists "Allow read of push subscriptions" on public.push_subscriptions;
create policy "Allow read of push subscriptions"
  on public.push_subscriptions for select
  using (true);

drop policy if exists "Allow update of push subscriptions" on public.push_subscriptions;
create policy "Allow update of push subscriptions"
  on public.push_subscriptions for update
  using (true)
  with check (true);

-- Policies for notification_logs
drop policy if exists "Allow insert of notification logs" on public.notification_logs;
create policy "Allow insert of notification logs"
  on public.notification_logs for insert
  with check (true);

drop policy if exists "Allow read of notification logs" on public.notification_logs;
create policy "Allow read of notification logs"
  on public.notification_logs for select
  using (true);
