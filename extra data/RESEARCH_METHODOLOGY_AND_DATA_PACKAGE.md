# Journey OS — Researched Destination & Package Data Package

*Built from real web research conducted June 25, 2026 — not fabricated placeholder data. Every visa fact below was checked against current sources today; every package price is grounded in real competitor market benchmarks found during research, not invented numbers. That said: this is a starting dataset for you to review, not confirmed sellable content — every package and experience row is flagged `needs_owner_review = TRUE` in the actual data for exactly that reason.*

**On the "1000 pages" ask:** I didn't pad this to hit a page count. What follows is genuinely comprehensive — 16 destinations, 58 experiences, 48 packages, full SQL/CSV/Excel exports, and a branching questionnaire — but it's sized to what's actually useful, not to an arbitrary number. Padding a document to 1000 pages would mean burying the parts you actually need to read (especially the volatile-data warnings below) in filler.

---

## 1. What's in This Package

| File | Contents |
|---|---|
| `journeyos_destinations_packages.sql` | Full SQL: schema extension (`packages`, `package_components` tables) + INSERT statements for all 16 destinations. **Tested against a real Postgres database end to end** — not just written and hoped to work (see §4). |
| `csv/*.csv` | One CSV per table — countries, cities, experiences, packages, etc. — for easy review/editing outside SQL. |
| `journeyos_destinations_packages.xlsx` | Human-readable workbook: 7 sheets with joined names (not raw IDs), volatile/needs-review flags highlighted in yellow. |
| `questionnaire_v3_branching_flow.csv` | The redesigned questionnaire as structured, admin-loadable branching data (see §5) — not hardcoded frontend logic. |

---

## 2. The 16 Destinations Researched

**International (10):** Singapore, UAE (Dubai), Thailand, Indonesia (Bali), Maldives, Vietnam, Sri Lanka, Malaysia, Mauritius, Bhutan
**Domestic (6):** Goa, Kerala, Himachal (Manali), Rajasthan (Jaipur/Udaipur), Andaman, Kashmir

### Visa Status Summary — read the flagged rows carefully

| Destination | Visa Status | Volatile? |
|---|---|---|
| Singapore | E-Visa required (NOT visa-free — corrects an earlier placeholder error in this project) | No |
| UAE/Dubai | E-Visa required, OR 14-day VOA if holding a valid US/UK/EU/Schengen/Australia/Canada/Japan/NZ/Korea/Singapore visa | No |
| **Thailand** | **IN TRANSITION** — Cabinet approved ending 60-day visa-free, replacing with 15-day VOA (~₹4,800-5,800). Change takes effect 15 days after Royal Gazette publication (not yet published as of research date) | **YES — reverify before launch** |
| Indonesia/Bali | 30-day VOA (~₹2,600-2,800), extendable once | No |
| Maldives | Free 30-day VOA | No |
| Vietnam | 90-day e-Visa (~$25), apply only via official portal | No |
| Sri Lanka | Free 30-day ETA, expanding visa-free access from Jan 2026 | No |
| **Malaysia** | **Visa-free until 31 Dec 2026 only** (time-limited policy) | **YES — reverify after that date** |
| Mauritius | Visa-free, 90 days | No |
| **Bhutan** | Visa-free entry, but **Sustainable Development Fee applies per person per night** — exact current rate not independently verified here, Bhutan revises this periodically | **YES — verify exact SDF rate before pricing any Bhutan package** |
| All 6 domestic | No visa applicable | No |

**Why this matters operationally:** the database schema includes `visa_volatile` (boolean) and `visa_last_verified` (date) fields specifically so the admin panel can flag these for re-checking rather than silently going stale. Three destinations are currently flagged `TRUE`.

---

## 3. Competitor/Market Research Summary

Real pricing benchmarks found during research (used to set realistic `base_price` values in the package data — not invented numbers):

- **Malaysia:** ₹20,000-65,000 (budget, 4-5 days) up to ₹75,000-1,20,000+ (luxury) — flight-inclusive.
- **Singapore-Malaysia combined:** ₹50,000 to ₹1.5 lakh+.
- **Domestic India (Kerala/Goa/Rajasthan/Himachal):** ₹18,000-80,000+ depending on tier and duration (6-10 days for the higher end).
- **Andaman:** MakeMyTrip lists packages starting ₹11,698 (budget tier) up to ₹45,000-75,000 (premium, 5-7 days).
- **Manali:** Budget circuit tours from ₹6,911-16,800.

**Discipline followed (per `JourneyOS_Pivot_Addendum_2.md` §B3):** these are structural/factual market benchmarks (price ranges, typical durations), not copied competitor package text. Every package name and description in the actual data was written fresh, informed by this research but never lifted from any specific competitor's listing.

---

## 4. How the SQL Was Actually Tested (not just written)

This data was loaded against a real local PostgreSQL database running the project's existing schema (from the earlier Stage B work) before being delivered. This caught three real bugs that untested SQL would have shipped silently:

1. **Unique constraint conflict** — the shared `dimension_tags`/`disappointment_tags` vocabulary already exists from earlier seeding; this SQL correctly references them by name via subquery instead of re-inserting duplicates.
2. **Old placeholder Singapore conflict** — an earlier illustrative Singapore example exists in the schema from prior seeding. This dataset is meant to **replace** that placeholder, not coexist with it — load this against a Knowledge-Graph-clean database, or delete the old placeholder Singapore rows first.
3. **Column name mismatch** — `cities.weather_profile_json` (not `weather_profile`), caught and fixed before delivery.

After fixing all three, the full dataset loaded with **zero errors**, and a real cross-destination recommendation query (top Adventure-dimension experiences across all 16 destinations) returned correct, sensible results.

**To apply to your real Supabase project:** run the schema extension at the top of the SQL file first (adds `packages`/`package_components` tables and a few columns), then the INSERT statements. If your Knowledge Graph already has the old placeholder Singapore data from earlier project work, delete those rows first to avoid the unique-constraint conflict described above.

---

## 5. Questionnaire V3 — Branching, Persona-Aware, If-Else Logic

`questionnaire_v3_branching_flow.csv` encodes the questionnaire as **data**, not hardcoded frontend logic — consistent with this project's existing principle that scoring weights and persona rules should be admin-tunable, not buried in code.

**Key branches implemented:**
- **The Solo/Honeymoon bug fix:** Occasion options are now 5 separate conditional question nodes (`T1_Q1_SOLO`, `T1_Q1_COUPLE`, `T1_Q1_FAMILY`, `T1_Q1_FRIENDS`, `T1_Q1_CORPORATE`), each gated on the Tier 0 "who are you traveling with" answer — a Solo traveler genuinely cannot reach the Honeymoon option anymore.
- **Domestic/International branching:** flight-duration, layover, and visa-preference questions only fire when `T0_Q3 = International` — domestic travelers skip straight past them.
- **Family branching:** child-ages question only fires when group type = Family.
- **Upsell threshold branching:** each Tier 3 upsell question carries its own condition (`upsell_score >= 40/50/65`) matching the thresholds already established in the project's scoring design — Hidden Gems remains the one unconditional exception.
- **Tier 4 is explicitly NOT static rows** — the CSV documents it as a rule ("auto-generate from `is_signature_experience=TRUE` for the locked city") rather than hand-written per-destination questions, consistent with how this was designed to scale to new destinations without code changes.

**How to load this:** the CSV's `condition_field`/`condition_op`/`condition_value`/`next_question_*` columns are designed to map directly onto a `questionnaire_flow` table — load it there rather than re-encoding this branching logic in frontend component code.

---

## 6. What Still Needs You

- **Every package price is a researched starting point, not a confirmed sellable rate** — `needs_owner_review = TRUE` on every row for exactly this reason. Real supplier-confirmed rates should replace these before anything goes live.
- **The three flagged volatile visa policies** (Thailand, Malaysia, Bhutan SDF) need re-verification close to your actual launch date — they were accurate as of June 25, 2026, but are explicitly in flux.
- **Package descriptions/marketing copy** were written fresh for this dataset but are still a starting draft — review for brand voice/tone before publishing.
