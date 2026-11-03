# Workflow and business-rule inventory

## 1. User journeys
| ID | Journey | Preconditions | Path | Postconditions |
|---|---|---|---|---|
| W1 | First-time user | Signed out | Landing, Start free, sign up, onboarding (4 steps), `/app` | Account exists, profile saved locally and to the API, starter workout shown |
| W2 | Returning user, same device | Session cookie valid | Open site, session restored, `/app` | Previous history visible |
| W3 | Returning user, new device | Account has completed onboarding | Sign in, profile fetched from the API, straight to `/app`, history pulled | Workouts, records, routines and memory present |
| W4 | Log a workout | In `/app` | Tick sets (clock starts, rest timer starts), edit weights/reps, add/remove sets and exercises, Finish | Workout saved (UUID, timestamp), summary dialog, form reset for the next workout |
| W5 | Offline logging | Signed in, then connection lost | Log and finish offline, reconnect | Record queued, then uploaded; badge changes from "Offline. 1 workout waiting" to "All workouts synced" |
| W6 | Routines | At least one exercise | Save as routine, later load it or Repeat last workout | Workout replaced (with confirmation if sets were already done) |
| W7 | Choose exercises | Picker or Explorer open | Filter, search, view suggestions, add, favorite | Exercises added with default sets; favorites stored |
| W8 | Coach chat with actions | Signed in | Open companion, send a message | Reply shown; notes remembered; actions applied (add exercise, favorite/avoid, set equipment, open screen) with confirmations |
| W9 | Coach plan | Signed in | Build my plan, Use today on a day | Today's workout replaced by the day's exercises |
| W10 | Settings and export | In `/app` | Change unit, rest time, switches; export | Settings persist; JSON file downloads |
| W11 | Password reset | Account exists | Forgot password, email link, new password, sign in | Password changed |
| W12 | Sign out | Signed in | Settings, Sign out (warning if unsynced) | Device data cleared, landing page |
| W13 | Two devices | Same account on two devices | Edit routines on both, sync | Additions from both kept; deletions stick |

## 2. State machines
- **Session clock:** idle -> running (first set ticked or Start) -> paused -> running ... -> idle (after Finish or reset). Restart: any -> running at 00:00 with sets cleared.
- **Workout record sync:** local only -> queued (cloud mode) -> synced; or queued -> failed permanently (4xx other than 401, 408, 429) which is flagged and dropped from the queue; or queued stays queued on 5xx, network error, 401 and 429.
- **Auth dialog:** signup <-> signin; signin -> forgot -> signin; reset (from email link) -> signin.
- **Exercise picker:** closed -> open -> (adds accumulate "Done (n)") -> closed (state reset).

## 3. Business rules (derived from code and tests)
| ID | Rule |
|---|---|
| BR-01 | A set counts as done when it is completed with reps above 0. Bodyweight sets (0 kg) count. |
| BR-02 | Volume = sum of weight x reps over counted sets. |
| BR-03 | Finish is disabled until at least one set is counted. |
| BR-04 | Weight is clamped to 0..1000 kg, reps to 0..200 in the UI; the API accepts 0..1000 and 0..500 and rejects the rest. |
| BR-05 | Estimated max (Epley) = weight x (1 + reps/30), rounded to 0.1; one rep returns the weight; 0 weight returns 0. |
| BR-06 | A set is a personal record only when its estimated max is strictly greater than the stored record (ties are not records); the first ever set of an exercise is a record. |
| BR-07 | Weights are stored in kg, rounded to 0.01. lb is display only (1 lb = 0.45359237 kg, shown to 0.1). |
| BR-08 | Workout duration is capped at 24 h when synced. Duration comes from timestamps, so it survives a locked phone. |
| BR-09 | The rest timer starts when a set is completed, using the chosen rest time (30..300 s options). |
| BR-10 | Streak = consecutive local calendar days with a workout; alive through yesterday. |
| BR-11 | Weekly sets per muscle count completed sets in the last 7 days; goal 12. |
| BR-12 | The recommender never returns an avoided exercise, filters by owned equipment, favours muscles that are behind this week, and lowers exercises done in the last 2 days. |
| BR-13 | Favorite and avoided are mutually exclusive per exercise. |
| BR-14 | Companion memory: at most 40 notes of 140 characters; routines at most 30 with 20 exercises each; same routine name (case-insensitive) replaces. |
| BR-15 | Pulling from the cloud adds missing workouts (newest 200) and never duplicates; routines and memory use a three-way merge so additions from both devices are kept and deletions stick. |
| BR-16 | Signing out deletes device data; if workouts are unsynced the user must confirm first. |
| BR-17 | In-progress (unsaved) workout state is kept in memory only. *(Observed. Whether this is intended is unknown; see defect DEF-001.)* |
| BR-18 | The coach may only apply a fixed list of actions; unknown actions are ignored and sets/reps are clamped. |

## 4. Open questions (no requirement found)
- Should an unsaved workout survive a refresh? (Currently it does not.)
- What should happen when the last exercise is removed from a workout? (Currently the screen shows no cards and Finish stays disabled.)
- Should the wrong-password message distinguish an unknown email? (Currently the server answers generically, which is good.)
