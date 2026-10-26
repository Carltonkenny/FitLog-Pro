# Technical Recommendations and Publish Checklist

## Must fix before public launch
1. **Deploy the Gemini Edge Function (code is written).** `supabase/functions/gemini-coach/index.ts` is an authenticated proxy with size, photo and rate limits. In Supabase: Edge Functions -> Deploy a new function named `gemini-coach`, paste the file, keep **Verify JWT** on, then add the secret `GEMINI_API_KEY` under Edge Functions -> Secrets. (CLI alternative: `supabase functions deploy gemini-coach` and `supabase secrets set GEMINI_API_KEY=...`.) Until it is deployed the coach only works in local dev, where `VITE_GEMINI_API_KEY` is read directly; that key is never included in production builds. **Original note:** move the Gemini call server-side. `VITE_GEMINI_API_KEY` is readable in the shipped JavaScript. Create a Supabase Edge Function (e.g. `gemini-coach`) that holds the key as a secret, requires a signed-in user (JWT), and rate-limits. Replace the `fetch` in `GeminiHistoryCoach.jsx` with `supabase.functions.invoke`. Rotate the current key, since it has been shared in chat.
2. **Supabase Auth settings** (dashboard):
   - Authentication -> URL Configuration: set Site URL to the production domain; add `https://<domain>/app` and `http://localhost:5173/app` to Redirect URLs.
   - Re-enable **Confirm email** (it was disabled for testing) and configure a custom SMTP sender; the built-in sender is limited to a few emails per hour.
   - Enable Google (Cloud Console OAuth client, redirect `https://witglwqwxcquvttyflir.supabase.co/auth/v1/callback`) if wanted.
3. **Remove `VITE_SKIP_AUTH` from any production environment.** It is ignored in production builds, but keep it out of Netlify variables.
4. **Verify sync end to end** with a real account: sign up, onboard, finish a workout, and confirm rows in `profiles`, `workouts`, `workout_sets`, `personal_records`. Then test offline -> online recovery.
5. **Legal pages:** privacy policy and terms (the app stores health-adjacent data and email).

## Should fix
- Delete dead code per `code-analysis-report.md` (about 1,870 lines plus template leftovers) after approval.
- Fix `npm test` (Node 25 exposes a broken global `localStorage`; stub it in the test harness) and add tests for `cloudSync.toRows` and PR detection.
- Add `personal_records` dedup (currently inserts a row per PR event; fine, but unbounded) and an UPDATE policy if upserts are wanted.
- Consume design tokens from `theme.css` instead of hard-coded hex values.
- Code-split landing vs app (604 KB single bundle) and compress the two hero images (about 1.6 MB).
- Add `<meta name="description">`, Open Graph tags and a social preview image to `index.html`; add a web app manifest if PWA install is desired.
- Add security headers via `netlify.toml` (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`).

## Publish steps (Netlify; `netlify.toml` is already in place)
1. Commit all changes (`git add -A`, review that `web/.env` is NOT staged).
2. Push to a GitHub repository and import it in Netlify. Build settings come from `netlify.toml` (base `web`, command `npm run build`, publish `dist`).
3. In Netlify -> Site configuration -> Environment variables, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Leave out `VITE_GEMINI_API_KEY` until the Edge Function exists (the coach shows a "not configured" state).
4. Deploy, then add the Netlify URL to Supabase redirect URLs (step 2 above).
5. Smoke test the live URL: landing, sign-up, onboarding, workout, sync, direct load of `/app`.
