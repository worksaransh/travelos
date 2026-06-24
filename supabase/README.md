# Journey OS — Database (Stage B)

Everything in this folder was written **and tested** against a local
PostgreSQL 16 instance before being delivered — not just written and hoped
to work. Four real bugs were caught and fixed this way (see each migration
file's comments for specifics): an infinite-recursion bug in the RLS helper
functions, an invalid UUID literal, missing type casts in the seed script,
and a permissions-matrix conflict that would have broken public destination
pages if implemented literally.

## How to apply this to your real Supabase project

`supabase.com` is not reachable from the sandbox these files were built in,
so this step has to happen on your end:

1. **Run migrations 001 through 005 first** (`001_domain_a_identity.sql`
   through `005_indexes.sql`) via the Supabase SQL Editor, or via the
   Supabase CLI (`supabase db push` if you set up local migrations tracking).
   **Skip `000_local_auth_mock_TESTING_ONLY.sql`** — real Supabase already
   has the `auth` schema and `auth.uid()`/`auth.role()` natively; running
   this file against a real project would conflict with what already exists.
2. **Run `006_rls_policies.sql`** — this references `auth.uid()` exactly the
   way real Supabase exposes it, so it should apply unmodified.
3. **Run `seed/001_seed_vocabulary_and_sample_data.sql`** if you want the
   sample Singapore data to build the UI stages against. Skip it if you'd
   rather start with a clean Knowledge Graph.
4. **Follow `AUTH_SETUP.md`** to enable anonymous sign-in, phone/OTP, and
   email magic-link in the dashboard — these can't be toggled from a SQL
   file.

## What's deliberately NOT here yet

No automated learning, no vector store, no ML-trained scoring — all
explicitly deferred per Phase 8. The `scoring_weights_config` values seeded
here are placeholders pending real calibration (Phase 12's master
checklist), not validated weights.
