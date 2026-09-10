# Repository Cleanup (Issue #11)

## What was cleaned up

### 1. Legacy codename redirects removed

The `LegacyProductRedirect` component in `client/src/App.tsx` mapped old internal
codenames to current product names:

| Legacy codename | Current product |
|----------------|-----------------|
| `sense`        | `workflo`       |
| `decide`       | `nexus`         |
| `scale`        | `astra`         |

These codenames were from an earlier naming iteration and are no longer used in
any external links, documentation, or marketing materials. The redirect routes
(`/product/sense`, `/product/decide`, `/product/scale`) have been removed.

The path normalization redirect (`/product` → `/products`) is retained since it
handles singular-to-plural path migration, not codename migration.

### 2. Admin page branding updated

The admin waitlist page (`AdminWaitlistPage.tsx`) displayed "WORKFLO / ADMIN" and
"Workflo" in its heading and footer. These have been updated to "CORTEX / ADMIN"
and "Cortex" to match the platform brand.

### 3. Environment variable aliases

The email service (`server/services/email.ts`) used `WORKFLO_*` environment
variable names. These now accept `CORTEX_*` as the preferred name with
`WORKFLO_*` as a backward-compatible fallback:

| Preferred (new)         | Fallback (legacy)        |
|------------------------|--------------------------|
| `CORTEX_EMAIL_MODE`    | `WORKFLO_EMAIL_MODE`    |
| `CORTEX_WAITLIST_TO_EMAIL` | `WORKFLO_WAITLIST_TO_EMAIL` |
| `CORTEX_EMAIL_FROM`    | `WORKFLO_EMAIL_FROM`    |
| `CORTEX_CONTACT_TO_EMAIL` | (already existed)       |
| `CORTEX_CONTACT_EMAIL_FROM` | (already existed)    |

This allows deployments to migrate to the `CORTEX_*` naming without breaking
existing environments that still use `WORKFLO_*`.

### 4. Email notification text updated

Waitlist notification emails previously said "New Workflo early-access request".
These now say "New Cortex early-access request" to match the platform brand.

### 5. Schema comments updated

The comment in `shared/schemas.ts` for the waitlist section was updated from
"Waitlist (Workflo early access)" to "Waitlist (Cortex early access)".

### 6. Todo checklist updated

The `todo.md` file referenced legacy product codenames ("Cortex Sense, Cortex
Decide, and Cortex Scale"). These have been updated to the current product
names ("Workflo, Nexus, and ASTRA").

## What was NOT changed

- **Product names** (Workflo, Nexus, ASTRA) are the current canonical names and
  remain unchanged throughout the codebase.
- **`WORKFLO_ADMIN_TOKEN`** environment variable is not renamed in this PR to
  avoid breaking existing authentication. It will be renamed in a future
  migration when Supabase Auth (#7) is fully adopted.
- **`WORKFLO_WAITLIST_FILE`**, **`CORTEX_CONTACT_FILE`**, etc. are file-path
  environment variables that remain unchanged.
- **Documentation files** (`design.md`, `docs/FOUNDATION.md`,
  `docs/DESIGN-IMPLEMENTATION.md`) are not modified as they describe the design
  system and IA, which still reference the current product names.

## Migration guide

To adopt the new `CORTEX_*` environment variable names:

1. Set `CORTEX_EMAIL_MODE` in your environment (same value as `WORKFLO_EMAIL_MODE`)
2. Set `CORTEX_WAITLIST_TO_EMAIL` (same value as `WORKFLO_WAITLIST_TO_EMAIL`)
3. Set `CORTEX_EMAIL_FROM` (same value as `WORKFLO_EMAIL_FROM`)
4. Remove the old `WORKFLO_*` variables once confirmed working
5. The application will automatically prefer `CORTEX_*` over `WORKFLO_*`
