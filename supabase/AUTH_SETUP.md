# Supabase Auth Provider Setup (B7)

**Why this is documentation, not a script:** `supabase.com`/`*.supabase.co` are not
in this sandbox's allowed network domains, so I cannot actually log into a
dashboard or call the Management API to toggle these from here. What I *could*
do — and did — was build a local mock of `auth.users` / `auth.uid()` /
`auth.role()` (see `000_local_auth_mock_TESTING_ONLY.sql`) and use it to
actually test that the schema's assumptions about auth are correct: that
`users.id` directly equals the Supabase auth user's `id`, so the
anonymous-sign-in-from-first-answer design in
`JourneyOS_Phase11_Development_Architecture.md §11.3` works as a real foreign
key relationship, not just a plan.

## What to enable in your real Supabase project (Authentication → Providers)

1. **Anonymous Sign-In** — toggle ON. This is the mechanism that gives every
   Tier 0 visitor a real, stable `auth.users.id` from their very first
   answer, before any contact info exists. Required for the B-stage build's
   `users.id references auth.users(id)` design to make sense.
2. **Phone (OTP / WhatsApp)** — toggle ON, configure your SMS/WhatsApp
   provider (Twilio or similar) under Authentication → Providers → Phone.
   This is the traveler-facing login method post-Gate-1.
3. **Email (Magic Link)** — toggle ON. This is the Agent/Admin/Super Admin
   login method per Phase 11 §11.2.

## What needs to happen at the identity-linking step (Gate 1)

When an anonymous user provides their WhatsApp number at Tier 5 Gate 1, use
Supabase's `linkIdentity` / phone-update flow to attach the phone credential
to the **same** anonymous `auth.users` row — do not create a second user and
migrate data across. This is the literal mechanism that makes the Phase 4
session-migration risk a non-issue: there is nothing to migrate because the
ID never changes.

## What was actually validated locally (not just planned)

- `users.id uuid primary key references auth.users(id)` — confirmed this FK
  resolves correctly and that RLS policies using `auth.uid() = id` correctly
  scope a traveler to their own row (see the RLS test results in this
  stage's build summary).
- The same `auth.uid()` function signature used here is what real
  Supabase/PostgREST expose at runtime — these RLS policies should apply to
  your real project **unmodified**.
