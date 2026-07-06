# ivendorz-security-checklist Skill

**Invoke:** `/ivendorz-security`

## Purpose
Multi-tenant data isolation + authorization pre-commit verification. Catches iVendorz-specific security invariants before they reach review.

## When to Use
- Before commits that touch auth, data access, org context, or multi-tenant flows
- After writing new API routes, server actions, or DB queries
- Quick security gate (5–10 min per change)

---

## 8-Point Checklist

### 1. Organization Context (Invariant #5: Users Act, Organizations Own)
- [ ] Every data write validates `active_org_id` on server (never client-supplied)
- [ ] Server action retrieves + validates org context from session
- [ ] Org ID sourced from JWT/session, never request body
- [ ] Error handling for missing/invalid org context

**BLOCKER Pattern:**
```typescript
// ❌ Client-supplied org ID
const data = await db.query(`WHERE org_id = ${req.body.orgId}`)

// ✅ Server-validated
const org = await validateUserOrg(userId, orgIdFromSession)
const data = await db.query(`WHERE org_id = ${org.id}`)
```

---

### 2. Authorization Layer (App-layer gates, RLS as backstop)
- [ ] Route/server action has explicit permission check (`can_*` capability)?
- [ ] RLS policy exists + aligns with app-layer rule (not inverted)?
- [ ] No raw SQL that bypasses RLS
- [ ] Admin (M8) never bypasses owning module's domain

**Verify:**
```typescript
if (!user.can_approve_po) throw Unauthorized()
// Then RLS: WHERE org_id = current_user.org_id enforces tenant isolation
```

---

### 3. Private/Public Boundaries (Invariant #11: Private Exclusion Stays Private)
- [ ] Private fields (buyer_private, is_blacklisted, internal_notes) never in public responses
- [ ] Vendor visibility scope respected (public | buyer_private)?
- [ ] Blacklist decisions undetectable (no 404 vs 403 leak)
- [ ] Soft-deleted records excluded from all queries

**BLOCKER:**
```typescript
// ❌ Private field exposed
res.json({ vendor, blacklisted: vendor.is_blacklisted })

// ✅ Scrubbed
const publicVendor = omit(vendor, ['is_blacklisted', 'internal_notes'])
res.json(publicVendor)
```

---

### 4. Cross-Module Access (Invariant #7: One Module, One Owner)
- [ ] No direct cross-schema SQL joins
- [ ] Cross-module communication only via services or M0 outbox events
- [ ] Only `contracts/` imported cross-module (never domain/ or infrastructure/)
- [ ] Foreign keys within module, never cross-schema

**BLOCKER:**
```typescript
// ❌ Direct cross-schema
SELECT * FROM identity.users JOIN rfq.rfqs ON ...

// ✅ Service call
const userDetails = await identityService.getUserById(userId)
```

---

### 5. Governance Signals Firewall (Invariant #6)
- [ ] No cross-mutation (Trust ≠ Performance Score)
- [ ] Financial Tier never raises Trust Score
- [ ] Buyer Approved/Blacklisted never mutates platform-wide scores
- [ ] Scores auto-calculated under System actor, never hand-edited

**Pattern:**
```typescript
const trustScore = calculateTrustScore(vendor) // M5 only
const performanceScore = calculatePerformanceScore(vendor) // M5 only
// NEVER: trustScore += performanceScore (firewall breach)
```

---

### 6. Data Visibility & Secrets
- [ ] No API keys, credentials, tokens in code
- [ ] No PII in error messages or logs (email, phone, org name)
- [ ] Audit logs exclude sensitive fields
- [ ] File uploads scoped to org (never world-readable)

**BLOCKER:**
```typescript
// ❌ Secrets in code
const apiKey = "sk_live_abc123"

// ❌ PII in logs
console.log(`Login for ${email}`)

// ✅ Redacted
console.log(`Login attempt from org ${orgId}`)
```

---

### 7. Soft Delete & Immutability (Invariant #8)
- [ ] Hard deletes never used (soft-delete only, `deleted_at` timestamp)
- [ ] Versioned docs never overwritten (new row with version++)
- [ ] Audit trail immutable (append-only)
- [ ] IDs never reused

---

### 8. Multi-Currency & Money Boundaries
- [ ] Currency stored per value field
- [ ] Platform never handles transaction money (no escrow/wallet)
- [ ] Money fields audit-tracked
- [ ] Financial calculations server-only (never frontend)

---

## Red Flags → Escalate

STOP and escalate if diff contains:
- [ ] New module created
- [ ] Cross-module DB access
- [ ] Governance signal mutation logic
- [ ] Org context bypass
- [ ] Hard delete of audit records
- [ ] Private field in public response
- [ ] Cross-schema raw SQL

---

## Reference
- CLAUDE.md §5 (Invariants), §4 (Governance Signals)
- Doc-2, Doc-4C, Doc-6B, ADR-021
