-- Adds separate phone and email fields to estimate requests, so you always get
-- a phone number and, when they leave one, an email. Safe to run any time,
-- including if you already ran customer-improvements.sql.

alter table estimate_requests
  add column if not exists phone text,
  add column if not exists email text;
