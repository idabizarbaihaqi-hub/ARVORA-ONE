# ARVORA ONE - Security Specification & Rules Architecture (Tahap 2)

## 1. Data Invariants
1. **Tenant Isolation Invariant**: No user can read, list, update, or delete any resource belonging to a `companyId` unless they are an active, registered member or owner of that company, or an authorized platform Super Admin.
2. **Identity Integrity Invariant**: Users cannot create or update profile documents with a different `id` than `request.auth.uid`.
3. **Privilege Escalation Invariant**: Normal users cannot set or elevate their own `platformRole` to `SUPER_ADMIN`, nor can they modify their own `role` within a company unless authorized by the tenant owner.
4. **Tenant Creation & Ownership Invariant**: When creating a new company, `request.resource.data.ownerId` must strictly equal `request.auth.uid`, and the creator is automatically registered as `COMPANY_OWNER`.
5. **Anti-Update-Gap / Schema Integrity**: All document writes must adhere to strict key limits, valid data types, string length bounds, and valid status enum values.
6. **Audit Trail Immutability**: Audit logs are append-only. No user (including company owners) may update or delete audit records.
7. **Suspension Lockdown Invariant**: When a company's status is `SUSPENDED`, write access to company configuration is locked except by platform Super Admins.

---

## 2. The Dirty Dozen Payloads (Red Team Penetration Vectors)

1. **PAYLOAD 1 (IDOR Cross-Tenant Read)**:
   Authenticated User A (Company A) queries `companies/{companyBId}` or `companies/{companyBId}/members`.
   *Expected Result*: `PERMISSION_DENIED`.

2. **PAYLOAD 2 (Self-Assigned Super Admin Escalation)**:
   Authenticated User submits `users/{uid}` with `platformRole: 'SUPER_ADMIN'` during registration or update.
   *Expected Result*: `PERMISSION_DENIED`.

3. **PAYLOAD 3 (Ghost Field / Shadow Property Injection)**:
   User updates company with arbitrary ghost field `isMasterSuperVip: true`.
   *Expected Result*: `PERMISSION_DENIED`.

4. **PAYLOAD 4 (Company Ownership Hijack)**:
   Non-owner updates `companies/{companyId}` setting `ownerId: attackerUid`.
   *Expected Result*: `PERMISSION_DENIED`.

5. **PAYLOAD 5 (Audit Log Tampering / Erasure)**:
   User sends `delete` or `update` request to `auditLogs/{logId}`.
   *Expected Result*: `PERMISSION_DENIED`.

6. **PAYLOAD 6 (Malicious ID Injection / Resource Exhaustion)**:
   User attempts to create document with 2KB junk characters ID or path poisoning.
   *Expected Result*: `PERMISSION_DENIED`.

7. **PAYLOAD 7 (Direct Member Role Self-Elevation)**:
   Employee sends write to `companies/{companyId}/members/{theirUid}` setting `role: 'COMPANY_OWNER'`.
   *Expected Result*: `PERMISSION_DENIED`.

8. **PAYLOAD 8 (Unauthorized Invitation Creation)**:
   Employee sends write to `companies/{companyId}/invitations/{inviteId}`.
   *Expected Result*: `PERMISSION_DENIED`.

9. **PAYLOAD 9 (Suspended Tenant State Bypass)**:
   Tenant is in status `SUSPENDED`, user attempts to update company settings.
   *Expected Result*: `PERMISSION_DENIED`.

10. **PAYLOAD 10 (Blanket List Scraping)**:
    User runs `getDocs(collection(db, 'companies'))` without scoping to their own company or owner ID.
    *Expected Result*: `PERMISSION_DENIED`.

11. **PAYLOAD 11 (Non-Owner Deleting Company)**:
    User attempts to delete `companies/{companyId}`.
    *Expected Result*: `PERMISSION_DENIED` (Companies cannot be deleted client-side).

12. **PAYLOAD 12 (Impersonated Audit Actor)**:
    User logs audit entry with `actorId` set to another user's UID.
    *Expected Result*: `PERMISSION_DENIED`.
