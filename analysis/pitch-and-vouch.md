# FitLog Pro: what it is, whether it is legit, and how to pitch it honestly

Written 2026-10-26 from what is actually in the code and tests, plus the market research in `product-audit-report.md` (blog and aggregator sources from mid 2026, so treat figures as directional).

## 1. What it is, in one paragraph
A free workout tracker that runs in the browser and installs on a phone's home screen. You log a set in two taps, it works with no signal, and it syncs to your account when you are back online. It finds your personal records, shows your progress, suggests which exercises to do based on your goal, your equipment and what you have neglected this week, and has a built-in coach (a small face button) that knows your history, remembers what you tell it, and can act on requests such as "add goblet squats to today's workout" or "build me a weekly plan from this photo of my gym".

## 2. How it works (plain English)
- **The app** is a website (React). You open it, sign up, answer four questions, and start logging.
- **Your phone saves first.** Every set is stored on the device the moment you tick it, so the gym's bad signal never loses a workout. Finished workouts upload in the background and retry until they succeed.
- **Accounts** use Neon Auth (a managed login service). Sign-in goes through the app's own address, which keeps you signed in on iPhone Safari.
- **The server** is one small program (a Neon Function). Your phone never talks to the database directly. It sends a short-lived login token, the server checks it, and then reads or writes only your rows. Another person's data is unreachable even if they guess an ID (this is tested).
- **The database** is Postgres on Neon. Workouts, sets, records, your plan, routines and the coach's memory live there.
- **Live updates:** log on your phone and your laptop updates by itself (Neon Realtime). If that ever fails, the app still syncs when opened.
- **The coach** sends your question, your recent workouts and what it remembers to Google Gemini through the server. The Gemini key stays on the server. If Google's main model is busy, the server retries on a lighter model. The coach can only do a short list of safe things: add an exercise, mark a favorite or one to avoid, set your equipment, open a screen, save a short note about you.
- **You control the memory.** Under Memory you can see, edit and erase everything the coach remembers.

## 3. Is it legit in the current market?
**Short answer: it is real, working software with a credible angle, but it is not a validated business yet. It is a good beta, not a proven product.**

What the market looks like (sources and dates in the audit report):
- A large, crowded category. Fitness app revenue estimates run from about $9B to $12B a year, but estimates vary a lot and nothing here sizes your niche.
- Strong free or cheap incumbents. Hevy is free with a paid tier of roughly $3 to $4 a month or about $75 lifetime. Strong is about $5 a month. Fitbod, which builds AI plans, has no free tier and costs roughly $80 to $96 a year. JEFIT is about $70 a year. (Prices from comparison blogs in July to September 2026; check the stores.)
- Retention is the industry's weak spot. Health apps lose a large share of users quickly. Anyone who says their fitness app has solved retention without data is guessing.

Where FitLog Pro is genuinely different:
1. **Free during early access** against paid or capped rivals.
2. **Offline-first** (one reviewer complaint about a rival was that it needs internet to log).
3. **A coach with persistent, user-controlled memory that takes actions inside the app.** Most trackers have either no AI or a one-time questionnaire.
4. **Photo input** (gym, equipment, form) for plans. I found no mainstream tracker advertising this, which means either a gap or low demand. That is a hypothesis to test, not a fact.

Where it is weak, and you should say so:
- A web app, not an App Store or Play Store app. It installs from the browser, but many lifters look in the stores first.
- 106 exercises (rivals have far more), no exercise photos yet, no wearables, no social feed, no payments.
- No real users yet. No retention data. No proof anyone will pay.
- It depends on Google's Gemini, which has rate limits and costs money at scale, and on Neon's beta realtime feature.
- Privacy and terms pages are not written yet.

**Verdict:** legitimate as an early-access product and a strong portfolio or proof-of-concept. Not yet credible to describe as "the next Hevy". Credibility will come from a few dozen real users using it for weeks, not from the feature list.

## 4. How to vouch for it truthfully
### Things you can say, and the proof behind each
| Claim | Proof you can point to |
|---|---|
| "It works offline and never loses a workout." | Workouts save on the device first and retry on a queue. Tested, and you can demo airplane mode live. |
| "Your data is private to your account." | The server checks identity on every request. 12 automated tests run against the real database, including a second user trying to read or overwrite the first user's workout (they get nothing / a not-found). |
| "No secrets in the app." | The database password, realtime secret and Gemini key exist only on the server. Checked in the built website files. |
| "The AI coach is not a black box." | Everything it remembers is visible and deletable. Its actions are a short fixed list and each one is confirmed on screen. |
| "It is tested." | 52 automated tests pass, including live checks of the database, live updates and the Gemini call. 0 known dependency vulnerabilities at the time of writing. |
| "You can take your data with you." | There is an export button in Settings. |

### Things not to say
- "Secure" or "hack-proof" without qualification. Say "built with the usual protections and tested", never "unhackable".
- Any user count, rating, testimonial or "trusted by". You have none yet. Never invent one.
- "Clinically proven", "medical", "physio" or anything health-claim. The coach gives general training tips only.
- "GDPR / HIPAA compliant". It is not certified for anything.
- "Better than Hevy / Strong / Fitbod". You have not tested them side by side with users.
- "Free forever". Say "free during early access".
- "AI personal trainer that replaces a coach". It is a helpful assistant, not a coach.

### Be upfront about three things
Early access, so things may break. Photos and coach messages are processed by Google Gemini (not stored by the app). The free hosting tiers mean it is sized for a small group right now.

## 5. Pitch kit
**One line:** "FitLog Pro is a free workout tracker that works offline and has a coach that remembers you and can build your workout."

**30 seconds:** "Most workout apps make you choose: a simple logger or an expensive AI plan. FitLog Pro logs a set in two taps, works with no signal, and has a coach that actually remembers your gear, your injuries and your history. You can tell it 'I only have dumbbells', and from then on it only suggests what you can do, and it can put the workout together for you. It is free while we are in early access, and I am looking for people to use it for two weeks and tell me honestly what is missing."

**3-minute live demo (do it on a phone):**
1. (0:00) Open the home-screen icon. Say: no login screen friction, it opens like an app.
2. (0:20) Tap **Repeat last workout**. Tick two sets. Point out the pre-filled weights and the rest timer.
3. (0:50) Switch on airplane mode, tick a set, switch it back. "Nothing lost."
4. (1:15) Open **Add exercise**. Show "Suggested for you" and the reason chips ("chest is behind this week").
5. (1:45) Open the coach. Say "I only have dumbbells and I love pull-ups. Add a goblet squat to today's workout, 4 sets of 8." Show the confirmations and the Memory screen.
6. (2:30) Show **Settings, export**, and say what is not built yet. Finish with your ask.

**By audience**
- **Your boss or colleagues:** lead with how it is built (offline-first, server-checked identity, tested against a real database, secrets kept off the client, runs on free tiers) and the clear list of what is missing. They want judgement, not hype.
- **Friends and testers:** lead with the demo and the two-week ask. Give them the tester summary.
- **Gym owners or trainers:** the honest hook is "a free tool your members could use". Do not promise client-management features; they do not exist.
- **Investors:** be plain that this is pre-traction. Show the problem, the four differentiators, the beta plan, and the metrics you will report (below). Do not show a market-size slide you cannot defend.

**Hard questions, honest answers**
- *Why not just use Hevy?* "Hevy is great and I use it as the bar. FitLog Pro is aimed at people who want advice from their own history, free, and offline. Whether that is enough is exactly what the beta tests."
- *Is the AI safe?* "It gives general tips, cannot access anything outside its short action list, shows what it does, and tells users to see a professional about pain."
- *Where does my data go?* "Your account's database on Neon. Coach messages and photos go to Google Gemini to answer you. The app does not keep the photos."
- *How will you make money?* "Not decided, and nothing is built. Free now. Options are a paid coach tier or a trainer version, but I will only choose once people actually use it."
- *Will it scale?* "It runs on free tiers sized for a small group. The design (stateless function plus Postgres) can grow, but I have not load-tested it."

## 6. What to measure so the next pitch has proof
- Share of testers who finish onboarding (target 8 of 10).
- Testers logging 3 or more workouts in two weeks (target 6 of 10).
- Share of workouts started with Repeat last workout or a routine.
- Coach questions per tester per week and how many led to an action.
- The single most common thing testers say is missing.
Report these numbers as they are, good or bad. A true small number is worth more than an invented big one.
