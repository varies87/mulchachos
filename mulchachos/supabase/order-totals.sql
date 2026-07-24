-- Lets you record the real amount of each job and log orders that came in by
-- text, phone, or in person. Safe to run any time.
--
--   final_total  — the actual job total you enter; the Customers view uses this
--                  when set, and falls back to the website estimate when not.
--   source       — where the order came from: 'website', 'text', 'phone', etc.

alter table estimate_requests
  add column if not exists final_total numeric(10,2),
  add column if not exists source text not null default 'website';
