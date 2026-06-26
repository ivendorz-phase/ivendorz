# Doc-7D — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7D_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · realize-never-redecide (no assumed Public projection) |
| Verdict | **NOT YET FREEZE-READY** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- **Public reads** `search_catalog` / `list_vendor_directory` / `get_public_vendor_profile` = **Public Query (anonymous), §8 GET** — verified vs `Doc-5D_Structure_v1.0_FROZEN` BC-MKT-6 §8. CORRECT.
- **Per-read projection rule** (Public / Controlling-Org / Internal-Service) — verified (`Doc-5D §1.x`); PR3 "Public projection only" correctly applies it.
- PR1 `(public)` route group + anonymous/no-active-org — conforms to `Doc-7C` SR2. CORRECT.
- PR6 reads via the Doc-7C **server-side** wired client; no browser-direct call — `Doc-7C §5.1`. CORRECT.
- Favorites correctly **excluded** (User membership-only — `Doc-5D` BC-MKT-7). CORRECT.

0 BLOCKER, 0 MAJOR — the surface scope is conservative (Public-only + non-disclosure + no anonymous mutation). Three projection/conformance refinements + one non-disclosure clarification.

### MINOR-1 — PR2 asserts microsite / catalog-detail / ads reads as Public without binding to a verified frozen Public read
Only **BC-MKT-6** (`search_catalog`/`list_vendor_directory`/`get_public_vendor_profile`) is **verified** Public-projection. PR2 also lists **vendor microsite**, **public product/category browse**, and **ads display** as views, but does **not** bind each to a confirmed Public-projection Doc-5D read — they are asserted Public (realize-never-redecide risk: a view could silently depend on a non-Public projection).
**Required fix:** PR2 state that **each view binds a confirmed Public-projection Doc-5D read at content**, and that any view whose only frozen read is Controlling-Org / Internal-Service (or has no frozen read) is **`[ESC-7-API]`** — not rendered on the anonymous surface by assumption. Name BC-MKT-6 as the verified core; microsite/catalog-detail/ads are **to-be-confirmed at content**.

### MINOR-2 — PR9 lists `CHK-7-003` (idempotency) in APPLIES then carves it N/A
PR9 puts `CHK-7-003` in the APPLIES set, then adds "N/A unless a frozen anonymous write exists." For a **read-only anonymous** surface this is contradictory.
**Required fix:** make `CHK-7-003` **conditional** — **N/A by default** (the Public surface is read-only, PR5), **APPLIES only if** a frozen anonymous write is later added (then idempotency per `Doc-7A §5.6`). Same conditional for `CHK-7-001/002/004`: they apply to the **reads** (binding/pagination/error), which do exist.

### MINOR-3 — PR9 trust badge (`CHK-7-005`) needs a Public-projection M5 read to render anonymously
PR9 cites the **trust badge** (M5 `Doc-5G`) as a composed embedded component on public profiles, but does not confirm `Doc-5G` exposes a **Public-projection** trust read for an anonymous viewer.
**Required fix:** PR9/PR2 state the public trust badge binds `Doc-5G`'s **Public-projection** read; `Doc-5G` is multi-actor (Public/User/Admin), so confirm the Public read at content — **if no Public trust read exists, the badge is omitted on the anonymous surface or `[ESC-7-API]`**, never assumed.

### NITPICK-1 — PR3 should state the public surface has no concept of buyer-private status at all
PR3 says no buyer-private/exclusion data is reachable. Strengthen: the public directory/profile reflects **only the `public` visibility scope** and the public surface has **no concept of buyer-private status whatsoever** — a vendor blacklisted by one buyer still appears publicly (Invariant #11: the exclusion is private to that buyer and invisible everywhere, including absent from any public-surface awareness).
**Required fix:** add the clarification to PR3.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 PR2 bind-or-ESC per view (Public projection) | MINOR | Structure Patch — explicit bind/ESC |
| MINOR-2 PR9 CHK-7-003 conditional | MINOR | Structure Patch — make read/write checks conditional |
| MINOR-3 PR9 trust badge Public read | MINOR | Structure Patch — confirm Doc-5G Public read or omit/ESC |
| NITPICK-1 PR3 no buyer-private concept | NIT | Structure Patch — clarify |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7D Structure Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — surface scope sound and conservative; three genuine projection/conformance defects (assumed-Public reads, conditional checks, trust-badge Public read).*
