# Usability review: what people will use FitLog Pro for

Based on reading and exercising the app myself. No real users have tested it yet, so everything below is a hypothesis until your close circle confirms it.

## The three jobs people hire a workout app for
1. **Record what I lifted, fast, mid-workout.** One hand, sweaty, 90 seconds between sets. This is the make-or-break job.
2. **Know what to do next.** "What should I train today, and with what weights?"
3. **See that it is working.** Personal records, streak, weekly sets per muscle.

Everything else (library, settings, analytics) exists to serve these three.

## How the app serves each job now
| Job | What a user does | Verdict |
|---|---|---|
| 1. Record | Open app (home-screen icon), set pre-filled with last weights, tap check (48 px), rest timer starts, tap Finish. Offline works. | Strong. Two taps per set. Weak spots below. |
| 2. Next | "Repeat last workout", saved routines, "Suggested for you" in the exercise picker, or ask the companion ("what should I train today?", "add goblet squat"). | Good. Recommendations are rule-based and explain themselves. Needs real use to tune. |
| 3. Progress | Progress tab: estimated max per lift with change since first session, sets per muscle this week, streak. | Fine for beta. Charts over time are missing. |

## Friction I found, and status
| Friction | Status |
|---|---|
| After Finish, the old ticked sets stayed on screen; a double tap saved a duplicate | **Fixed.** Workout resets with last weights pre-filled; Finish is disabled until a set is done |
| Timer lost seconds when the phone locked | **Fixed.** Uses timestamps |
| "333+ exercises" was false (there were 28) | **Fixed.** 106 exercises, real count shown everywhere |
| Picking from a long list with no guidance | **Fixed.** Suggestions with reasons, muscle and equipment filters, favorites |
| Small buttons in the workout screen | **Fixed.** 48 px main action, 40 px most others |
| Companion could claim it did something it had not | **Fixed.** Actions are confirmed in the chat with a check mark; replies that cut off are rejected |
| Studio / Mobile toggle in the header | Open. A normal user does not need to choose a layout. Recommend hiding it on phones |
| No "Next" key to hop between weight and reps | Open. Hevy users complain about the same thing. Worth adding |
| Body weight and body-fat are collected but never shown or tracked | Open. Either track it (weight trend chart) or stop asking |
| No rest-timer notification when the screen is off | Open. Needs the installed PWA plus notification permission; test demand first |
| Onboarding does not ask for equipment | Open. It is one click in the picker or by telling the companion. Consider adding it as step 3 |
| No exercise photos or demonstrations yet | In progress. Slots are built; see `exercise-images-guide.md` |

## The companion ("pet")
- It knows your goal, experience, history, records and what you told it. It can add exercises to today's workout, mark favorites and exercises to avoid, set your equipment, open screens, and build a weekly plan, with or without photos.
- You can see, edit and erase everything it remembers (Memory button). Memory syncs to your account.
- Honest limits: it is a chat assistant with a face. It does not message you first or track you in the background. It cannot see photos you sent in earlier chats. Its answers depend on Gemini being available (it has been "busy" on and off today; the app retries once, then tells the user).
- Privacy: memory notes can contain health-related statements such as an injury. They are stored on the user's own profile row only, and only the user can read them. The privacy policy should say so.

## High-leverage things added this round
Repeat last workout and saved routines; personalised exercise suggestions; favorites and avoid lists; equipment filter; companion memory and actions; install to home screen (PWA, works offline); data export; 106-exercise library; image slots ready.

## Not added on purpose
Social feed, wearables, calorie tracking, workout videos. Each is expensive and none serves the three jobs above. Revisit only if testers ask for them repeatedly.

## What I would measure in the beta
- Time from opening the app to the first completed set (target under 20 seconds on a repeat day).
- Workouts logged per tester per week (target 3).
- Share of workouts started with "Repeat last workout" or a routine.
- Companion questions per tester per week, and how many led to an action.
- Anything testers say they did on paper or in another app instead.
