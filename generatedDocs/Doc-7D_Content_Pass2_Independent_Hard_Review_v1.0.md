# Doc-7D — Content Pass-2 (§5–§9 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7D_Content_v1.0_Pass2.md` (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5G/5D Public-projection conformance |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- **§9.1 applicability matches frozen PR9** (conditional `CHK-7-003`; `CHK-7-011` CTA-scoped). CORRECT.
- §5 no anonymous mutation; CTAs → `(auth)` group → Doc-7E; CTA gating = UX. CORRECT (`Doc-7C` SR2; `Doc-7A §4.3`).
- §6 server-side wired reads; cursor pagination; no browser-direct call. CORRECT (`Doc-7C §5`).
- §7.2 published-only discoverability (`Doc-5D R5`); §9.2 ESC register (PRODDETAIL/CATNAV/ADS) — CORRECT.

0 BLOCKER, 0 MAJOR. Two Public-read **coverage** items (the pass under-bound M5) + one non-disclosure fold-in + one nit.

### MINOR-1 — the public trust badge is **fully BOUND**; remove the "confirm/omit" hedge
Pass-1/§9.1 left the trust badge as "confirm/omit." **Verified `Doc-5G R2` + §4/§5/§4:** the public-badge reads exist — **`get_trust_score`** (BC-TRUST-2 §5), **`get_performance_score`** (BC-TRUST-3 §5), **`get_verified_tier`** (BC-TRUST-1 §4) are all **"public badge"** reads (no `Authorization`, no `Iv-Active-Organization`).
**Required fix:** bind the public trust badge to **`get_trust_score` / `get_performance_score` / `get_verified_tier`** (Doc-5G public badge reads) — **BOUND**, not confirm/omit. No `[ESC-7-API]`.

### MINOR-2 — missing view: **public published reviews** on the vendor profile/microsite
The pass omits a real Public read. **Verified `Doc-5G` BC-TRUST-5 §7:** `get_review` / `list_reviews` are **"public, published only"** Queries. The public vendor profile/microsite should display **published reviews**.
**Required fix:** add **public published reviews** (`get_review` / `list_reviews`, published-only, BC-TRUST-5 §7) to the §4 microsite/profile view + the Appendix inventory — a BOUND Public read. (Published-only honors `Doc-5D R5` / `Doc-5G R10`.)

### MINOR-3 — fold in Doc-5G R10 (badge shows public score/tier only; verification internals never public)
§3/§7 cover Doc-5D non-disclosure but not the M5 firewall. **`Doc-5G R10`:** verification **case detail, fraud signals, admin ratings are staff-internal — never public**; protected reads collapse to `NOT_FOUND`.
**Required fix:** §3/§4 note — the public badge/profile exposes **only the public score / tier / published review**, **never** verification case detail, fraud signals, or admin ratings (`Doc-5G R10`); these collapse to `NOT_FOUND` if probed.

### NITPICK-1 — §9.1 `CHK-7-071` wording for a read-only surface
`CHK-7-071` (blobs via `file_ref`; cache disposable) applies because the public surface **renders media** (vendor logos, product images) as **`file_ref` references**, holding no authoritative blob.
**Required fix:** §9.1/§6 note the public surface renders media as `file_ref` references (no authoritative blob), satisfying `CHK-7-071`.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 trust badge fully BOUND | MINOR | Content Patch — bind Doc-5G public badge reads |
| MINOR-2 missing public-reviews view | MINOR | Content Patch — add BC-TRUST-5 reviews |
| MINOR-3 Doc-5G R10 fold-in | MINOR | Content Patch — badge public-only |
| NITPICK-1 CHK-7-071 media wording | NIT | Content Patch — file_ref media |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7D FROZEN.

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — two genuine M5 Public-read coverage gaps caught (trust badge BOUND, public reviews missing), tying the public profile to verified Doc-5G public badge/review reads.*
