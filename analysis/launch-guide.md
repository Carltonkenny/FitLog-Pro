# Launch guide (Neon edition)

The backend is already deployed on Neon (project `FITLOG`, branch `production`): Postgres, Neon Auth, the `api` function and Realtime. What is left is yours to do: your own Gemini key, putting the site online, and inviting friends.

## 0. What runs where
| Piece | Where |
|---|---|
| Website (React app) | Netlify (free) |
| Accounts | Neon Auth, reached through your own site at `/neon-auth` so iPhone Safari keeps you signed in |
| Data, AI coach, live updates | The `api` Neon Function plus Neon Postgres |
| Gemini key | A secret on the `api` function. It is never in the website |

## 1. Use your own Gemini key (2 minutes)
1. Create a key at https://aistudio.google.com/app/apikey. Delete the old one there (it was shared in chat).
2. Open `web/.env.production` (git-ignored) and replace the value after `GEMINI_API_KEY=`.
3. In a terminal: `cd web` then `neon deploy --env .env.production`. You should see `~ function api`.
The coach tries `gemini-3.6-flash` first and falls back to `gemini-3.1-flash-lite` if Google says "busy" or "rate limited". You can change either with `GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL` in the same file.

## 2. Put the site online (about 15 minutes)
1. Create a free GitHub account if needed. The code is already on GitHub at `Carltonkenny/FitLog-Pro` (branch `chore/web-publish-prep`).
2. Create a free account at https://www.netlify.com. **Add new site, Import an existing project**, pick that repository and the branch. Netlify reads `netlify.toml`.
3. Under **Site configuration, Environment variables** add exactly these three (copy the values from `web/.env`):
   - `NEON_AUTH_BASE_URL`
   - `NEON_FUNCTION_API_BASE_URL`
   - `NEON_REALTIME_URL`
   Do NOT add `DATABASE_URL`, `NEON_REALTIME_SECRET` or any key. The site must never see those.
4. Deploy. You get an address such as `https://something.netlify.app`.
5. Tell Neon to trust that address, and let the API accept calls from it:
   - `neon neon-auth domain add https://something.netlify.app`
   - In `web/.env.production` set `ALLOWED_ORIGINS=https://something.netlify.app`, then run `neon deploy --env .env.production` again.
6. Open the site on your phone and run the tester checklist yourself first.
If you see "FitLog Pro is not configured", step 3 was missed. Add the variables and redeploy.

## 3. Invite your close circle
Send them `analysis/tester-summary.md` (copy the text into WhatsApp) and the link.
- They tap **Start free**, enter name, email and a password of 8+ characters. No email confirmation is needed in this test setup.
- Install on the home screen: Android Chrome, three-dot menu, **Install app** (or Settings inside the app). iPhone Safari, Share button, **Add to Home Screen**.
- Collect feedback in one WhatsApp group plus a short Google Form.

## 4. What to watch
- Neon console, **Tables**: `profiles`, `workouts`, `workout_sets` fill up as friends use it.
- `neon logs query` shows function errors.
- Day 3 and day 14: ask each tester "did you log a workout this week?"

## 5. Good to know
- **Password reset email** uses Neon's shared sender (`auth@mail.myneon.app`). It is rate limited. Test it once yourself.
- **Google sign-in** is off. It can be turned on with `VITE_GOOGLE_AUTH=true`, but it uses Neon's shared development keys (Neon branding on the Google screen) and has not been tested on iPhone.
- **AI Gateway** (Neon's own model service) is not used because it needs a paid plan. Gemini is called directly from the function.
- **Realtime** is a Neon beta feature. If it ever fails, the app still syncs every time it is opened.
- Before strangers use it: privacy policy and terms pages, your own email sender in Neon Auth, a Google Cloud spending cap, and error monitoring.
