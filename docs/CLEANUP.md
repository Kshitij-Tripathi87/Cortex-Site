# Repository Cleanup

Issue #11 removes stale marketing-era naming from the public application surface and makes the deployment documentation match the current production architecture.

## Completed

- Removed the client-side `/product/:slug` codename router. Canonical product URLs are under `/products/*`; server-side legacy redirects remain where required.
- Removed obsolete `WORKFLO_ADMIN_TOKEN` from the Render contract.
- Updated the admin experience to Cortex branding and Supabase Auth terminology.
- Restored `.env-example` with safe placeholders and explicit server-only secret guidance.
- Corrected deployment documentation to use the current Supabase tables and migration sequence.
- Added the production deployment runbook.

## Naming rule

Use `Cortex` for the company/site and the canonical product names in `shared/catalog.ts` for product references. Do not introduce legacy route slugs or environment variables into new code.

## Secret rule

Credentials and provider keys belong only in protected Render environment settings. The repository may document variable names and placeholders, but never their values.
