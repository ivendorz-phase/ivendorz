# review-a-lens Skill

**Invoke:** `/review-a-lens`

## Purpose
Review-A architecture & governance lens. Team-4 role (Architecture & Governance review). Catches scope/conformance/coined-field/firewall violations before they reach Review-B.

## When to Use
- After `/fe-checklist` passes
- Reviewing completed code/branches for Review-A gate
- Quick conformance audit without full `/code-review`
- Checking "does this match frozen docs?"

## Role Context

**Team-4 = Review-A = Architecture & Governance**
- Reviews **first** (after dev completes)
- Lens: projection · coined-field-enum-state-slug · firewall · non-disclosure · scope · contract-grounding · invented-route
- Verdict: PASS → hand to Team-5 (Quality & Adversarial) · REVISION → 🟠 · BLOCKER → 🟥
- Board closes; I never self-approve
- Fresh context; never review churning tree

---

## Review-A Checklist (8 Points)

### 1. Scope: One Module, One Owner
**Check:** Does code respect module boundaries?

- [ ] No direct cross-schema SQL (no `JOIN identity.users + rfq.rfqs`)
- [ ] Cross-module calls only via `contracts/` (services, events, never domain/)
- [ ] No `@` imports from another module's domain or infrastructure
- [ ] Foreign keys within module only

**Pattern (BLOCKER):**
```typescript
// ❌ Cross-module DB access
SELECT * FROM identity.users u JOIN rfq.rfqs r ON u.id = r.created_by_id

// ✅ Service call across boundary
const user = await identityService.getUserById(rfqCreatedById)
```

**Find:**
```bash
git diff HEAD | grep -E 'FROM.*\.|JOIN.*\.|\$queryRaw'
# If cross-schema → BLOCKER
```

---

### 2. Coined Field Check
**Check:** Are new enum/state/slug fields invented in code, or grounded in frozen docs?

- [ ] New `status` enum → referenced in Doc-4* (state machines section)?
- [ ] New `kind` enum → registered in authoritative event catalog (Doc-4J)?
- [ ] New state constant → documented in state machine (Doc-4M)?
- [ ] No invented slug names (use ADR-024 naming if URL-affecting)

**Pattern (MAJOR):**
```typescript
// ❌ Invented status on quotation
enum QuotationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED_BUYER = 'accepted_buyer', // ← not in Doc-4M quotation state machine
  REJECTED = 'rejected',
}

// ✅ From Doc-4M quotation state machine
enum QuotationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  AWARDED = 'awarded',
  DECLINED = 'declined',
}
```

**Find:**
```bash
git diff HEAD | grep -iE 'enum|type.*=.*\{|const.*Status|const.*KIND'
# Check each against frozen state machine docs
```

---

### 3. Governance Signal Firewall
**Check:** Does code violate the 5-signal firewall (Invariant #6)?

- [ ] No cross-mutation of signals (Trust ≠ Performance Score)?
- [ ] Financial Tier never raises Trust Score?
- [ ] Buyer Approved/Blacklisted never mutates platform-wide scores?
- [ ] Scores auto-calculated under System actor, never hand-edited?

**Pattern (BLOCKER):**
```typescript
// ❌ Firewall breach
if (vendor.financialTier === 'A') {
  vendor.trustScore = Math.max(vendor.trustScore, 85) // ← cross-mutation
}

// ✅ Independent calculation
const trustScore = calculateTrustScore(vendor) // M5 only, no dependencies
```

---

### 4. Non-Disclosure: Private/Public Boundaries
**Check:** Are private fields hidden on public surfaces?

- [ ] Vendor `is_blacklisted`, `buyer_private_notes` never in public endpoint?
- [ ] Trust Score visible on public surfaces (display-silent per Board ruling)?
- [ ] Buyer `internal_notes` never exposed outside buyer org?
- [ ] Private exclusion undetectable (no 404 vs 403 pattern leak)?

**Pattern (BLOCKER):**
```typescript
// ❌ Private field exposed
res.json({
  vendor,
  blacklisted: vendor.is_blacklisted, // ← confidential
})

// ✅ Scrubbed for public
const publicVendor = omit(vendor, ['is_blacklisted', 'internal_notes'])
res.json(publicVendor)
```

---

### 5. Contract Grounding: API Contracts
**Check:** Do API responses match frozen contract docs (Doc-4A)?

- [ ] Request/response payloads match Doc-4A API metastandard?
- [ ] DTO types grounded in `contracts/types.ts` (not invented in route handler)?
- [ ] Optional vs required fields correct?
- [ ] Pagination follows frozen pattern (`skip`, `limit`, `total`)?

**Pattern (MAJOR):**
```typescript
// ❌ Invented DTO in route handler
app.get('/api/vendors/:id', async (req, res) => {
  const vendor = { id, name, trustScore, created_at } // ← ad-hoc shape
  res.json(vendor)
})

// ✅ Grounded in contract
import type { GetVendorDetailResponse } from '../contracts/types'
app.get('/api/vendors/:id', async (req, res): Promise<GetVendorDetailResponse> => {
  const vendor = await vendorService.getDetail(id)
  res.json(vendor)
})
```

---

### 6. Invented Route Check
**Check:** Are new routes documented + registered?

- [ ] New route added to `IMPLEMENTATION_START_HERE.md` (page universe)?
- [ ] ESC class assigned (ESC-BUY-*, ESC-VEN-*, etc.)?
- [ ] Route registered in `scripts/verify-fe-wbs-coverage.mjs`?
- [ ] Private routes not leaked as public (check `app/(public)/` vs `app/(app)/`)?

**Pattern (MINOR if doc miss, BLOCKER if private route exposed):**
```typescript
// ❌ New route not registered
app/dashboard/analytics/page.tsx // ← not in page universe

// ✅ Registered
// IMPLEMENTATION_START_HERE.md: P-BUY-42 Buyer Analytics Dashboard
// scripts/verify-fe-wbs-coverage.mjs: ESC-BUY-ANALYTICS
```

---

### 7. Module Invariants & Projection Validation
**Check:** Does code respect module-specific invariants (Doc-4*)?

**M1 (Identity):**
- [ ] Org context never null on domain operations
- [ ] Roles assigned per two dimensions (Participation ≠ Org Role)

**M2 (Marketplace):**
- [ ] Vendor visibility scope respected (public | buyer_private)
- [ ] Trust scores never calculated (M5 owns)

**M3 (RFQ):**
- [ ] RFQ state machine followed (Doc-4M)
- [ ] Routing decisions never hardcoded (M3 engine owns)

**M4 (Operations):**
- [ ] Document kind frozen-only (Doc-4M: loi/po/challan/wcc/trade_invoice/payment)
- [ ] Buyer Vendor Status private to buyer (never platform-wide score)

**M5 (Trust):**
- [ ] Scores auto-calculated, never hand-edited
- [ ] Signals independent (no firewall cross-mutations)

**M6 (Communication):**
- [ ] Notifications delivery-only (no state machine)
- [ ] Chat read-models never source of truth

**M8 (Admin):**
- [ ] Admin never mutates owning module's business logic
- [ ] Bans/suspensions audit-tracked

---

### 8. Type Safety & Grounding
**Check:** Are types properly anchored?

- [ ] All IDs use type-safe wrappers (UUIDv7 or year-scoped `RFQ-2026-*`)?
- [ ] Currency stored per field (not assumed global)?
- [ ] Org ID always typed (not `string`)?
- [ ] Event payloads match authoritative catalog (Doc-4J)?

**Pattern (MAJOR):**
```typescript
// ❌ Untyped IDs
function getVendor(id: string) { ... }

// ✅ Type-safe IDs
function getVendor(id: VendorId) { ... }
type VendorId = Brand<string, 'VendorId'>
```

---

## Red Flags (Stop & Escalate)

BLOCKER if:
- [ ] New module created
- [ ] Cross-module DB access
- [ ] Governance signal mutation
- [ ] Org context removed
- [ ] Private field in public response
- [ ] Hard delete of audit/versioned records
- [ ] Invented state/enum not in frozen docs

→ Escalate to human review (not auto-REVISION).

---

## Verdict Template

```
🟢 PASS / 🟠 REVISION / 🟥 BLOCKER

Scope: ✓ (no cross-module access)
Coined Fields: ✓ (statuses from Doc-4M)
Governance: ✓ (no signal cross-mutation)
Non-Disclosure: ✓ (private fields hidden)
Contracts: [finding if any]
Routes: ✓ (registered in page universe)
Invariants: ✓ (M4 document kinds frozen-only)
Types: ✓ (IDs type-safe)

Overall: [PASS/REVISION/BLOCKER]
[If REVISION: list findings with severity + remediation]
[If BLOCKER: escalate + cite frozen doc]
```

---

## Reference

- **CLAUDE.md** §5 (12 Core Invariants), §4 (Governance Signals)
- **Doc-2** (Database & Outbox)
- **Doc-4A** (API Metastandard)
- **Doc-4B–4M** (Module contracts + state machines)
- **Doc-4J** (Authoritative Event Catalog)
- **ADR-021, ADR-024, ADR-025**
- **Memory:** `Team-4 Quality & Conformance role` (Review-A lens definition)
- **Memory:** `Team-4 QCT gate progress` (review sequence)

---

## Notes

- Fresh context: never review a churning tree (stable target rule)
- Raise ≠ Accept: I raise findings; author/Board evaluates + decides
- Findings gate: BLOCKER=0, MAJOR=0, MINOR=0 before merge
- Conflicts with frozen doc → Flag-and-Halt, escalate to human
