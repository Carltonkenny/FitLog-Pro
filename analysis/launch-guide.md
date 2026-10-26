# Launch guide: from this laptop to your close circle

Do the steps in order. Each step says what you should see when it works.

## Part 1. Supabase setup (about 20 minutes)

### 1.1 Run the database migration
1. Open https://supabase.com/dashboard and open your project.
2. In the left menu click **SQL Editor**, then **New query**.
3. On your computer open `supabase/migrations/20261026_security_hardening.sql` in Notepad or VS Code. Select all (Ctrl+A), copy (Ctrl+C).
4. Paste into the SQL Editor and click **Run**.
5. You should see "Success. No rows returned". If you see a red error, copy the message to me and do not continue.
6. Check: open **Table Editor**, click `profiles`. You should see new columns `routines` and `coach_memory`.
It is safe to run twice.

### 1.2 Get a new Gemini key and retire the old one
The old key was pasted into a chat, so treat it as exposed.
1. Open https://aistudio.google.com/app/apikey and sign in.
2. Click **Create API key** and copy the new key. Do not paste it in any chat.
3. Keep it for step 1.3. Later, in the same page, delete the old key (the one starting `AQ.Ab8R`).
4. For local testing only: edit `web/.env` and replace the value after `VITE_GEMINI_API_KEY=` with the new key.

### 1.3 Deploy the coach function (this keeps the key off users' devices)
1. In Supabase click **Edge Functions** in the left menu, then **Deploy a new function** and choose **Via Editor**.
2. Name it exactly `gemini-coach`.
3. Open `supabase/functions/gemini-coach/index.ts` on your computer, copy everything, paste it into the editor, click **Deploy**.
4. Open the function's settings and make sure **Verify JWT** is switched **on**.
5. Go to **Edge Functions**, then **Secrets** (also at Project Settings, Edge Functions). Add a secret named `GEMINI_API_KEY` and paste the NEW key as the value.
6. Check later: on your live site, sign in, open the companion and say hello. A reply means it works. "The AI coach is not deployed yet" means step 1 or 2 is wrong. "Not set up" means the secret is missing.

### 1.4 Auth settings
1. **Authentication, Providers, Email**:
   - **Confirm email**: for a small friends test I recommend turning it **off**. Supabase's built-in email sender allows only a handful of emails per hour, so confirmation emails will fail once several friends sign up. Turn it back on when you add your own email service (Resend or Brevo both have free plans).
   - Minimum password length: set 8.
2. Do the URL step after you have your live address (Part 2).
3. Google sign-in is optional. Skip it for now.

## Part 2. Put the app on the internet (about 15 minutes)
1. Create a free account at https://github.com and make a **private** repository. Upload this project (GitHub Desktop is the easiest way: File, Add local repository, Publish). Confirm that `web/.env` is NOT in the list of files being published. It is ignored by git, so it should not be.
2. Create a free account at https://www.netlify.com. Click **Add new site**, **Import an existing project**, choose GitHub, choose the repository. Netlify reads `netlify.toml` and fills the build settings.
3. Before deploying, open **Site configuration, Environment variables** and add exactly two:
   - `VITE_SUPABASE_URL` = your project URL (same value as in `web/.env`)
   - `VITE_SUPABASE_ANON_KEY` = the publishable key (same value as in `web/.env`)
   Do NOT add `VITE_GEMINI_API_KEY` or `VITE_SKIP_AUTH`.
4. Click **Deploy**. When it finishes you get an address like `https://something.netlify.app`.
5. Back in Supabase: **Authentication, URL Configuration**. Set **Site URL** to your Netlify address. Under **Redirect URLs** add `https://something.netlify.app/**`. Save.
6. Open the Netlify address on your phone and run the tester checklist yourself first.
If you see "FitLog Pro is not configured", step 3 was missed. Add the variables and redeploy.

## Part 3. Give it to your close circle
1. Send them the link and the file `analysis/tester-checklist.md` (copy the text into WhatsApp or email).
2. Tell them it is a test: things may break, and what they log could be reset.
3. How they get in: they tap **Start free**, enter name, email and a password, and answer 4 onboarding questions. No other setup.
4. Put it on the home screen so it feels like an app:
   - **Android (Chrome):** open the site, tap the three-dot menu, **Install app**. Or sign in, open Settings, tap **Install app**.
   - **iPhone (Safari only):** tap the Share button, then **Add to Home Screen**.
5. Collect feedback in one place: a WhatsApp group plus a short Google Form with five questions (what did you use it for, what confused you, what was missing, would you use it weekly, any bug with a screenshot).

## Part 4. What to watch while they test
- Supabase **Table Editor**: `profiles` rows appear for each tester; `workouts` and `workout_sets` fill as they log. This confirms sync works for real people.
- Supabase **Logs**, Edge Functions: errors from the coach.
- Ask each tester on day 3 and day 14: "did you log a workout this week?" That answer matters more than any compliment.
- Success for a first round: 8 of 10 testers finish onboarding, 6 of 10 log 3 or more workouts in two weeks.

## Part 5. Before you invite strangers (not needed for friends)
Privacy policy and terms pages, re-enable email confirmation with a proper sender, account deletion, a Gemini spending cap in Google Cloud, and error monitoring.
