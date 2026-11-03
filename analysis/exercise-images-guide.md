# Adding exercise and equipment images (for Antigravity or any image tool)

The app already has image slots. **Drop a file in the right folder with the right name and it appears. No code change.**

## How it works
- Exercise photo: `web/public/exercises/<exercise_id>.webp`
  Example: `web/public/exercises/goblet_squat.webp`
- The full list of ids and names is in `analysis/exercise-ids.csv` (106 rows: id, name, muscle, equipment, filename).
- Where they show: the exercise picker (52 px thumbnails), and the header of each exercise card in the active workout (48 px). If a file is missing, the picker shows a neutral dumbbell icon and the workout card shows nothing. Nothing breaks.
- Equipment photos: use `web/public/equipment/<name>.webp` with these names: `barbell`, `dumbbells`, `cables`, `machines`, `bodyweight`. They are not displayed anywhere yet. Tell me where you want them (for example next to the equipment chips) and it is a one-line change.

## Image specs (keep them consistent so the app looks professional)
| | |
|---|---|
| Format | WebP |
| Size | 640 x 480 px (4:3). The app crops to a square from the centre, so keep the subject centred |
| File size | under 60 KB each (the full set should stay under about 7 MB) |
| Style | one consistent look for all 106: same lighting, same background, same camera angle style |
| Content | one person demonstrating the movement at its midpoint, or a clear equipment shot. No text, logos or watermarks |
| Safety | use AI-generated or properly licensed images only. Do not use photos of real people without their written permission |

## Suggested prompt for the image tool
"Studio photo of a fit adult demonstrating the <exercise name> with <equipment>, mid-movement, side-on view, plain dark charcoal background, soft rim lighting, realistic, no text, no logo, centred subject, 4:3."
Generate in batches by muscle group (Chest, Back, Legs, Shoulders, Arms, Core) so the style stays uniform. Check form: wrong form in a picture is worse than no picture.

## Steps
1. Generate and review the images. Check the exercise form against the cue shown in the app.
2. Convert to WebP at 640x480 and compress (squoosh.app works in a browser).
3. Name each file exactly as the `filename` column in `exercise-ids.csv`.
4. Copy them into `web/public/exercises/`.
5. Run the app. The images appear. Commit them (about 5 MB is fine for git).

## Adding more exercises later
Add a row to `web/src/lib/exerciseCatalog.js` (format is documented at the top of that file), add its image, and it shows up in the picker, the recommender and the companion's list automatically.
