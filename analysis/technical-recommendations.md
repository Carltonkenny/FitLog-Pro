# Technical recommendations and publish checklist (Neon backend)

## Done
- Backend on Neon: Postgres, Neon Auth, `api` Function, Realtime. Schema in `neon/schema.sql` (`npm --prefix web run db:migrate`).
- All data access goes through the `api` function, which verifies the caller's Neon Auth JWT and scopes every query to that user. The browser never receives database credentials or the realtime secret.
- 52 automated tests, including 12 against live Neon Postgres (ownership isolation, validation, rollback) and live Realtime and Gemini checks.

## Before inviting people
1. Replace the Gemini key in `web/.env.production`, then `cd web && neon deploy --env .env.production`.
2. Deploy the site on Netlify with only `NEON_AUTH_BASE_URL`, `NEON_FUNCTION_API_BASE_URL`, `NEON_REALTIME_URL`.
3. `neon neon-auth domain add https://<site>` and set `ALLOWED_ORIGINS` for the function, then redeploy it.
4. Sign up yourself and run the tester checklist once (this is the one end-to-end path automation cannot do for you).

## Before strangers use it
- Privacy policy and terms pages (the app stores health-related notes and email).
- Your own email sender for Neon Auth (the shared one is rate limited), then consider requiring email verification.
- A spending cap on your Google Cloud project for the Gemini key.
- Error monitoring, and a way for users to delete their account and data.
- The AI Gateway (Neon) needs a paid plan; not used.

## Known limits
- The API's per-user coach limit (30 per hour) is kept in memory per function instance, so it is best-effort.
- Google sign-in is off by default and untested on iPhone Safari.
- Realtime is a Neon beta feature; the app still syncs on open without it.
