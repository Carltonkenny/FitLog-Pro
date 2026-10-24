💪
FitLog Pro
Simple Workout Log & Tracker
PRODUCT SPECIFICATION DOCUMENT
Version 1.0  |  October 2026
Prepared by: Tabor Synergy
Platform: Android (Google Play Store)
Status: MVP Specification — Ready to Build

Table of Contents

1.  Executive Summary
2.  Market Research & Competitor Analysis
3.  Target Audience
4.  What Makes FitLog Pro Different
5.  App Architecture
6.  Database Schema
7.  Complete Screen Specifications
8.  Feature List
9.  Monetization Strategy
10. Tech Stack
11. Build Prompts (AI Tool Instructions)
12. Build Timeline
13. Play Store Launch Checklist
14. Copyright & Legal Compliance
15. Revenue Projections

1. Executive Summary

FitLog Pro is a professional Android workout logging and tracking app targeted at gym-goers, home workout users, and fitness enthusiasts globally — with a strong focus on the Indian market. The app solves a clear, validated problem: people track their workouts in messy notes apps, paper diaries, or WhatsApp — leading to zero visibility into progress and zero motivation to continue.

FitLog Pro offers a clean, fast, and professional workout logging experience with progress tracking, body stats, streaks, and a freemium monetization model. The app is designed to be built by a solo developer in 8 weeks using Flutter, Firebase, and AI coding tools.

Attribute
Detail
App Name
FitLog Pro
Platform
Android (Google Play Store) — iOS in Phase 2
Category
Health & Fitness
Business Model
Freemium — Free tier + Pro subscription + Ads
Target Market
India (primary), Global (secondary)
Development Framework
Flutter (Dart)
Backend
Firebase (Firestore + Auth + Analytics)
AI Build Tool
Claude.ai + VS Code (Free)
MVP Build Time
8 Weeks
Play Store Fee
$25 one-time
Monthly Cost to Run
₹0 (Firebase free tier covers up to 50K users)

2. Market Research & Competitor Analysis

2.1 Market Size
The global fitness app market is one of the fastest-growing mobile app categories. Workout tracker apps are a proven, high-revenue sub-category with multiple solo-built products generating $30K–$500K per month.

Metric
Data
Global Fitness App Market (2026)
$46 Billion
Workout Tracker Category MRR (top apps)
$30K – $500K/month each
Strong Workout Tracker Revenue
~$500K/month (50K downloads)
Alpha Progression Revenue
~$55K/month (solo-built)
India Gym Users (2026)
75 Million+
India Fitness App Downloads Growth
38% YoY
Play Store — Health & Fitness CAGR
14.7% through 2034

2.2 Competitor Analysis
Research was conducted across the top 6 workout tracker apps on Play Store — Strong, Hevy, Fitbod, JEFIT, FitNotes, and Setgraph. The following comparison highlights their strengths, weaknesses, and the gaps FitLog Pro fills.

App
Rating
Free Tier
Price/Month
India Pricing
WhatsApp
Offline
Key Weakness
Strong
4.9★
3 routines only
$4.99
❌ USD only
❌
✅
Expensive, no free tier
Hevy
4.9★
Generous — 4 routines
$2.99
❌ USD only
❌
✅
Limited exercise library
Fitbod
4.8★
Trial only (3 workouts)
$12.99–$15.99
❌ USD only
❌
⚠️
Most expensive, no real free tier
JEFIT
4.6★
Yes
$6.99
❌ USD only
❌
⚠️
Cluttered UI, outdated design
FitNotes
4.4★
Full free
Free
✅ Free
❌
✅
No cloud sync, no progress charts
Setgraph
4.7★
Limited
$3.99
❌ USD only
❌
✅
Small exercise library
FitLog Pro
—
Generous free tier
₹149/mo
✅ INR pricing
✅
✅
— (our app)

2.3 User Complaints from Competitor Apps (Validated Gaps)
The following pain points were identified from real 1–3 star reviews across Play Store and Reddit for the top workout apps:

Features appearing free in screenshots are hidden behind expensive paywalls
Apps crash or freeze during active workout logging — the worst possible time
No India-specific pricing — $9.99/month is unaffordable for most Indian users
Poor UI after updates — complex navigation to reach basic features
No WhatsApp or regional language integration
Exercise data hard to export when switching apps
No rest timer customization on free tier
Social comparison pressure causes anxiety in some users

FitLog Pro directly addresses: INR pricing, stable logging, clean UI, generous free tier, offline-first, and no social pressure features.

3. Target Audience

Segment
Description
Age
Pain
Primary — Gym Regulars
Lifters training 3–5x/week in commercial gyms
18–35
Track weights on paper or notes app
Secondary — Home Workout Users
Dumbbell / bodyweight training at home
22–40
No structured tracking system
Tertiary — Beginners
Just started gym, need guidance and motivation
18–28
Overwhelmed by complex apps
Quaternary — Women Fitness
Yoga, HIIT, toning workouts
20–38
Existing apps feel masculine

4. What Makes FitLog Pro Different

Feature
FitLog Pro
Competitors
INR Pricing
₹149/month — affordable
$4.99–$15.99/month USD
Free Tier Generosity
Unlimited logging, 50 exercises, 30-day history
Locked behind paywall quickly
Offline First
Full offline — all data stored on device first
Some require internet
No Social Pressure
No public feed — personal journey only
Hevy pushes social comparison
Clean UI
Minimal, fast, dark mode on free tier
JEFIT cluttered, Strong too plain
India Market
INR pricing, Hindi UI in Phase 2, UPI in Phase 2
No India focus
Stability
Crash-free logging is non-negotiable
Multiple crash complaints
AI Workout Tips
Claude API generates tips per workout
None on free tier

5. App Architecture

5.1 Architecture Pattern
FitLog Pro follows an Offline-First architecture. All workout data is written to local device storage first (SQLite via Hive), then synced to Firebase Firestore in the background when internet is available. This ensures zero data loss in the gym where connectivity is often poor.

Layer
Technology
Purpose
UI Layer
Flutter + Dart
All screens, animations, navigation
State Management
Provider / Riverpod
App-wide state — user, workouts, settings
Local Storage
Hive (NoSQL) + SharedPreferences
Offline data, user preferences
Remote Database
Firebase Firestore
Cloud sync, backup, cross-device
Authentication
Firebase Auth
Google Sign-In + Email/Password
Analytics
Firebase Analytics
User behaviour, retention tracking
Crash Reporting
Firebase Crashlytics
Real-time crash monitoring
Ads
Google AdMob
Banner + interstitial ads on free tier
Payments
Google Play Billing
Subscription management
AI Features
Claude API (Anthropic)
Workout tips, AI suggestions
Notifications
Firebase Cloud Messaging
Workout reminders, streak alerts

5.2 Navigation Structure
Bottom navigation bar with 5 tabs — persistent across the app:

Tab 1 — Home (Dashboard + Today's Plan)
Tab 2 — Workout (Start / Templates / Active Workout)
Tab 3 — History (Calendar View + Past Workouts)
Tab 4 — Progress (Charts + PRs + Body Stats)
Tab 5 — Profile (Account + Achievements + Settings)

6. Database Schema

All collections below are stored in Firebase Firestore with the same structure mirrored locally in Hive for offline access.

USERS COLLECTION
Field
Type
Description
uid
String
Firebase Auth UID — primary key
name
String
Display name
email
String
User email
avatar_url
String
Profile photo URL
goal
String
build_muscle / lose_weight / get_stronger / stay_active
fitness_level
String
beginner / intermediate / advanced
weight_kg
Number
Body weight in kg
height_cm
Number
Height in cm
age
Number
User age
plan
String
free / pro_monthly / pro_yearly / pro_lifetime
plan_expiry
Timestamp
When current plan expires
streak_count
Number
Current workout streak in days
total_workouts
Number
All-time workout count
created_at
Timestamp
Account creation date
updated_at
Timestamp
Last profile update

WORKOUTS COLLECTION
Field
Type
Description
id
String
Auto-generated UUID
uid
String
User ID — foreign key
name
String
Workout name (e.g. "Push Day")
date
Timestamp
Workout date and start time
duration_seconds
Number
Total workout duration
total_volume_kg
Number
Sum of all weight × reps
total_sets
Number
Count of completed sets
notes
String
Optional workout notes
is_template
Boolean
True if saved as reusable template
exercises
Array
Embedded array of exercise objects (see below)
created_at
Timestamp
When workout was logged

EXERCISES SUB-DOCUMENT (EMBEDDED IN WORKOUT)
Field
Type
Description
exercise_id
String
Reference to exercise library
exercise_name
String
Name (denormalized for speed)
muscle_group
String
Primary muscle targeted
sets
Array
Array of set objects {set_number, weight_kg, reps, completed}
notes
String
Per-exercise notes
order
Number
Display order in workout

EXERCISES_LIBRARY COLLECTION (PRELOADED — 300 EXERCISES)
Field
Type
Description
id
String
Unique exercise ID
name
String
Exercise name (e.g. "Barbell Bench Press")
muscle_group
String
chest / back / shoulders / biceps / triceps / legs / core / cardio
equipment
String
barbell / dumbbell / machine / cable / bodyweight / resistance_band
type
String
strength / cardio / flexibility
instructions
String
How to perform the exercise
is_custom
Boolean
True if user-created custom exercise
uid
String
User ID — only set for custom exercises

PERSONAL_RECORDS COLLECTION
Field
Type
Description
id
String
Auto-generated UUID
uid
String
User ID
exercise_id
String
Exercise reference
exercise_name
String
Exercise name
weight_kg
Number
Best weight achieved
reps
Number
Reps at that weight
one_rep_max
Number
Calculated 1RM using Epley formula
achieved_at
Timestamp
Date PR was set
workout_id
String
Which workout this PR came from

BODY_STATS COLLECTION
Field
Type
Description
id
String
Auto-generated UUID
uid
String
User ID
weight_kg
Number
Body weight on this date
body_fat_pct
Number
Body fat percentage (optional)
logged_at
Timestamp
Date of measurement
notes
String
Optional notes

7. Complete Screen Specifications

All 25 screens are listed below with their purpose, components, user actions, and technical notes. The app uses a consistent dark/light theme toggle. Default theme: Light with Dark Mode available in Pro tier.

SECTION A — ONBOARDING (SCREENS 1–9)

Screen #
Screen Name
Key Components
User Action
Technical Note
S-01
Splash Screen
App logo + animation, tagline
Auto-proceed after 2s
Check auth state — redirect to S-02 or S-10
S-02
Welcome
Hero image, app name, tagline, 2 CTAs
Tap Get Started or Sign In
Smooth fade-in animation
S-03
Goal Selection
5 goal options with icons, single select
Tap one goal
Save to local state, Firestore on completion
S-04
Fitness Level
3 levels with icons + descriptions
Tap one level
Inform default workout intensity
S-05
Workout Days
2–6 days, tap to select number
Tap days per week
Store as user preference
S-06
Equipment
4 options, multi-select with icons
Select all that apply
Filter exercise library based on selection
S-07
Personal Details
Name, age, weight, height, unit toggle
Fill form, tap Next
Validate all fields before proceeding
S-08
Account Creation
Google Sign-In button, Email/Password, Skip
Sign up or skip
Firebase Auth — skip creates anonymous session
S-09
Soft Paywall #1
Pro benefits list, 7-day trial CTA, Continue Free link
Accept trial or skip
Trigger after sign-up — soft, not blocking

SECTION B — CORE APP SCREENS (SCREENS 10–15)

Screen #
Screen Name
Key Components
User Action
Technical Note
S-10
Home / Dashboard
Greeting, today's workout card, weekly streak, quick stats, Start Workout CTA
Tap Start Workout
Real-time streak calculation from Firestore
S-11
Exercise Library
Search bar, muscle group filters, exercise cards with image + description
Search or filter, tap to view
Full offline access — library stored locally
S-12
Workout Templates
Pre-built and custom template cards, Start / Preview buttons
Start or preview template
10 pre-built templates included at launch
S-13
Active Workout
Workout timer, exercise list, set rows (weight/reps), rest timer, Add Exercise
Log sets, add exercises, finish
MOST CRITICAL — must be crash-free and fast
S-14
Rest Timer
Countdown timer, Skip / +30s / -30s, vibration, next set preview
Tap controls
Auto-starts after each completed set
S-15
Workout Summary
Duration, volume, sets, PR badges, motivational message, Save + Share
Save workout
Calculate PRs here — write to PR collection

SECTION C — HISTORY & PROGRESS SCREENS (SCREENS 16–20)

Screen #
Screen Name
Key Components
User Action
Technical Note
S-16
Workout History
Calendar with workout dots, list of past workouts, workout cards
Tap workout to view detail
Calendar highlights days with workouts
S-17
Workout Detail
Full exercise list, sets, weights, volume total, Repeat Workout button
Tap Repeat Workout
Load this workout as new active session
S-18
Progress Charts
Exercise dropdown, weight over time chart, volume chart, PR markers, date range filter
Select exercise, change range
FL Chart library — line + bar charts
S-19
Body Stats
Weight log entry, weight chart over time, BMI display, measurements log
Add weight entry
Free feature — key retention driver
S-20
Personal Records
All exercises list with best weight + date, trophy icons for recent PRs
View — read only
Sort by date — most recent first

SECTION D — PROFILE & SETTINGS SCREENS (SCREENS 21–25)

Screen #
Screen Name
Key Components
User Action
Technical Note
S-21
Profile
Avatar, name, total stats summary, badges earned, Edit button
Edit profile or view badges
Stats pulled from Firestore aggregates
S-22
Achievements
Grid of badges — locked and unlocked, progress toward next badge
View details of each badge
20 achievement badges at launch
S-23
Settings
Units, rest timer default, notifications, theme, sync, privacy, rate app, support, delete account
Toggle settings
SharedPreferences for local settings
S-24
Notification Settings
Workout reminder time picker, daily motivation toggle, weekly summary toggle
Set times and toggles
Firebase Cloud Messaging for push
S-25
Pro Upgrade / Paywall
3 plan options with pricing, feature comparison table, restore purchases
Select plan, purchase
Google Play Billing API

8. Feature List — Free vs Pro

Feature
Free
Pro
Workout logging — unlimited sessions
✅
✅
Exercise library — pre-built exercises
50 exercises
300+ exercises
Workout history
30 days
Unlimited
Progress charts — weight over time
Basic (1 month)
Advanced (all time + multiple exercises)
Custom workout routines
1 routine
Unlimited routines
Rest timer
Fixed 90 seconds
Fully customizable
Personal records tracking
✅
✅
Body weight + stats tracking
❌
✅
Workout streaks + calendar
✅
✅
Achievements and badges
Basic (5 badges)
Full (20 badges)
Cloud backup and sync
❌
✅
Dark mode theme
❌
✅
Workout share as image
❌
✅
Data export (CSV)
❌
✅
AI workout tips (Claude API)
❌
✅
Ad-free experience
❌ (ads shown)
✅ (no ads)
Plate calculator
❌
✅
Custom exercises
Up to 3
Unlimited
1RM calculator
❌
✅

9. Monetization Strategy

9.1 Subscription Plans
Plan
India Price
Global Price
Billing
Target User
Free
₹0
$0
Forever
User acquisition — convert to paid
Pro Monthly
₹149/month
$1.99/month
Monthly
Try-before-commit users
Pro Yearly
₹799/year
$9.99/year
Annual — best value badge
Committed fitness users
Pro Lifetime
₹1,999 once
$24.99 once
One-time purchase
Power users who want to own it

9.2 Ad Revenue (Free Tier)
Ad Type
Placement
Frequency
Revenue Est.
Banner Ad
Bottom of History screen
Always visible on free tier
₹0.50–₹2 per 1000 impressions
Interstitial Ad
After workout completion
Once per workout
₹5–₹15 per 1000 impressions
Rewarded Ad
Unlock one extra chart for 24 hours
User-triggered optional
₹20–₹50 per 1000 completions

9.3 Soft Paywall Strategy
FitLog Pro uses a non-aggressive soft paywall. Users can experience the core value of the app — logging a workout, seeing their history, earning their first badge — before ever seeing a paywall. The paywall appears at:

After account creation (S-09) — 7-day free trial offer
When user tries to access Pro-only feature (contextual)
After 5th workout completed — "Unlock your full journey" message
Profile screen — persistent visible upgrade button

10. Tech Stack

Layer
Technology
Version
Cost
Purpose
App Framework
Flutter
3.x
Free
Cross-platform Android/iOS app
Language
Dart
3.x
Free
Flutter programming language
State Management
Riverpod
Latest
Free
App-wide state management
Local Database
Hive
Latest
Free
Offline-first local storage
Remote Database
Firebase Firestore
Free tier
Free (up to 50K users)
Cloud sync and backup
Authentication
Firebase Auth
Free tier
Free
Google Sign-In + Email
Analytics
Firebase Analytics
Free tier
Free
User behaviour tracking
Crash Reporting
Firebase Crashlytics
Free tier
Free
Real-time crash monitoring
Charts
FL Chart
Latest
Free
Progress graphs and charts
Ads
Google AdMob
Free
Free (revenue share)
Monetize free tier
In-App Purchase
Google Play Billing
Latest
Free (30% fee)
Subscription management
AI Features
Claude API (Anthropic)
claude-sonnet-4-6
Pay per use (~₹0.01/call)
Workout tips generation
Push Notifications
Firebase Cloud Messaging
Free tier
Free
Workout reminders
Development IDE
VS Code + Android Studio
Latest
Free
Code writing + testing
AI Coding Assistant
Claude.ai
Free tier
Free
Write all Flutter/Dart code
Version Control
GitHub
Free tier
Free
Code repository
CI/CD
GitHub Actions
Free tier
Free
Automated testing + builds
Distribution
Google Play Store
—
$25 one-time
App publishing

11. Build Prompts — AI Tool Instructions

The following prompts are designed to be pasted directly into Claude.ai (free tier) to generate the Flutter code for each week of development. Each prompt is self-contained and builds on the previous week's output.

WEEK 1 PROMPT — PROJECT SETUP + ONBOARDING
Create a Flutter 3.x app called "FitLog Pro". Use Riverpod for state management and Hive for local storage. Firebase is not needed yet — use Hive only for now.

Create the following:
1. Splash screen with animated logo and auto-navigation after 2 seconds
2. Welcome screen with a hero image placeholder, app title "FitLog Pro", tagline "Track. Progress. Conquer.", and two buttons: "Get Started" and "I Already Have an Account"
3. Goal selection screen with 5 options: Build Muscle, Lose Weight, Get Stronger, Stay Active, Custom — each with an icon and description — single select
4. Fitness level screen: Beginner, Intermediate, Advanced — with icons and short descriptions
5. Workout days screen: tap-to-select buttons for 2 through 6 days
6. Equipment screen: Full Gym, Dumbbells Only, Bodyweight, Resistance Bands — multi-select
7. Personal details form: Name, Age, Weight (kg), Height (cm) — with unit toggle (metric/imperial)
8. Account creation screen: Google Sign-In button (placeholder), Email + Password fields, Skip option

Use a clean professional color scheme: primary color #1A73E8 (blue), dark text #1A1A2E, white backgrounds. All screens should have smooth slide transitions. Store all onboarding data in Hive locally.

WEEK 2 PROMPT — EXERCISE LIBRARY + TEMPLATES
Add the following screens to our FitLog Pro Flutter app:

1. Exercise Library screen:
   - Search bar at the top
   - Filter chips: All / Chest / Back / Shoulders / Arms / Legs / Core / Cardio
   - Grid of exercise cards showing: exercise name, muscle group, equipment type, a colored icon representing the muscle
   - Preload at least 50 exercises as a Hive-stored list (create a Dart model: ExerciseModel with fields: id, name, muscleGroup, equipment, type, instructions, isCustom)
   - Tap an exercise to see its full details with instructions

2. Workout Templates screen:
   - Section: "Pre-Built Programs" with 5 horizontal scrollable template cards
   - Templates to create: Push Pull Legs (3-day), Full Body (3-day), Upper Lower (4-day), Bro Split (5-day), Beginner Full Body (3-day)
   - Each template shows: name, days per week badge, difficulty badge, muscle group coverage
   - "Start Workout" button and "Preview" button on each card
   - Section: "My Templates" — empty state with "Create Your First Template" button

Use the Riverpod provider pattern. All data stored in Hive offline.

WEEK 3 PROMPT — ACTIVE WORKOUT + REST TIMER
Build the Active Workout screen — this is the most critical screen, must be fast and crash-free:

1. Active Workout Screen:
   - Header: Workout name (editable) + running timer (stopwatch format HH:MM:SS)
   - Floating action button: "+ Add Exercise" — opens exercise library
   - Exercise blocks: each exercise shows name, muscle group, and a list of set rows
   - Set row: Set number | Weight (kg) input | Reps input | Checkmark button
   - Previous session weight shown in grey under each set input
   - Tapping checkmark marks set as done (green highlight)
   - Swipe left on set row to delete it
   - "+ Add Set" button under each exercise
   - Swipe left on exercise block to remove exercise
   - "Finish Workout" prominent button at bottom
   - All data auto-saved to Hive every 10 seconds

2. Rest Timer Screen (modal bottom sheet):
   - Large countdown timer display (MM:SS)
   - Buttons: Skip | -15s | +30s
   - Vibrate when countdown reaches zero
   - Shows next set info (exercise name + previous weight) while resting
   - Auto-starts when a set is marked as complete
   - Default time: 90 seconds (configurable in Settings)

3. Workout Summary Screen:
   - Total duration, total volume (kg), total sets completed
   - PR (Personal Record) badges — automatically detected by comparing with Hive-stored PRs
   - Motivational message: pick from 10 preset messages randomly
   - "Save Workout" button — saves to Hive + shows confetti animation
   - "Discard" option (confirm dialog)

WEEK 4 PROMPT — HISTORY + PROGRESS CHARTS
Add History and Progress screens to FitLog Pro:

1. Workout History Screen:
   - Monthly calendar view at top — days with workouts shown as blue filled circles
   - Below calendar: chronological list of past workout cards
   - Each workout card: date, workout name, duration, total volume, number of exercises
   - Tap any card to open Workout Detail screen
   - Empty state illustration + "Log your first workout" for new users

2. Workout Detail Screen (past workout):
   - Full breakdown of the workout — all exercises, all sets, weights, reps
   - Volume and duration summary
   - "Repeat This Workout" button — loads it as a new active session
   - Share as image button (Pro feature — show lock icon on free)

3. Progress Charts Screen:
   - Dropdown to select any exercise
   - Line chart showing max weight over time for selected exercise (use fl_chart package)
   - Bar chart showing total volume per session
   - Personal Record highlighted with a gold star marker on the chart
   - Date range filter: 1M / 3M / 6M / 1Y / All
   - (Free tier: last 30 days only — show upgrade prompt for more)

4. Personal Records Screen:
   - List of all exercises the user has logged
   - For each: best weight, reps at that weight, date achieved
   - Trophy emoji for PRs set within last 7 days
   - Sort by: Most Recent / Alphabetical

WEEK 5 PROMPT — PROFILE + ACHIEVEMENTS + SETTINGS
Add Profile, Achievements, Body Stats, and Settings screens:

1. Profile Screen:
   - Circular avatar with camera upload option
   - User name and goal badge
   - Stats row: Total Workouts | Total Volume (tonnes) | Current Streak
   - Achievements preview — show 3 most recent badges with "See All" link
   - Edit Profile button

2. Body Stats Screen:
   - Log weight entry: date picker + weight input in kg
   - Weight over time line chart (fl_chart)
   - BMI calculator and display
   - Body measurements log: chest, waist, hips, arms, legs (optional fields)
   - History list of all weight entries

3. Achievements Screen:
   - 5 rows × 4 columns grid of badge cards
   - Each badge: icon + name + description + locked/unlocked state
   - 20 badges total — examples:
     * First Rep (log first workout)
     * Week Warrior (7-day streak)
     * Century (100 total workouts)
     * Heavy Lifter (log 100kg+ on any exercise)
     * Consistent (30-day streak)
     * Volume King (total 10,000kg in one workout)
   - Progress bar on locked badges showing how close user is

4. Settings Screen with sections:
   - Preferences: Units (kg/lbs), Rest timer default, Theme (Light/Dark — Pro only)
   - Notifications: Workout reminder time, Daily motivation, Weekly summary
   - Account: Edit profile, Change password, Backup and sync (Pro only)
   - App: Rate FitLog Pro, Share app, Contact support, Privacy policy, Terms of service
   - Danger Zone: Delete all data, Delete account (both with confirmation dialogs)

WEEK 6 PROMPT — FIREBASE + PAYWALL + ADMOB
Integrate Firebase, monetization, and ads into FitLog Pro:

1. Firebase Setup:
   - Add Firebase to the Flutter app (google-services.json)
   - Implement Firebase Auth: Google Sign-In + Email/Password
   - Implement Firestore sync: when user is signed in, sync all Hive data to Firestore
   - Offline persistence: enable Firestore offline caching — app must work fully without internet
   - Crashlytics: initialize for crash reporting
   - Analytics: log key events (workout_started, workout_completed, exercise_added, upgrade_tapped)

2. Pro Upgrade Screen:
   - Three plan cards: Monthly (₹149), Yearly (₹799 — Best Value badge), Lifetime (₹1,999)
   - Feature comparison table: Free vs Pro (8 key features)
   - "Start 7-Day Free Trial" button
   - "Restore Purchases" text link at bottom
   - Integrate Google Play Billing API for subscription handling

3. AdMob Integration (Free users only):
   - Banner ad at bottom of History screen
   - Interstitial ad after every 3rd completed workout
   - No ads for Pro users
   - Test ads during development — replace with real Ad Unit IDs before launch

4. Pro Feature Gates:
   - Wrap all Pro-only features with a ProGate widget
   - ProGate shows a lock icon and "Upgrade to Pro" button when user is on free tier
   - Do NOT block access to core logging features — only extras

WEEK 7 PROMPT — POLISH + HOME DASHBOARD + AI TIPS
Final polish and Home Dashboard for FitLog Pro:

1. Home Dashboard (S-10) — complete rebuild:
   - Dynamic greeting: "Good morning, [Name]! 💪" based on time of day
   - Today's workout card: if a workout was planned, show it with a "Start" button
   - Streak counter with flame emoji — show current streak and best streak
   - Weekly overview bar chart: days of week, highlight days with workouts
   - Quick stats: Workouts This Week | Volume This Week | Total Workouts All Time
   - Recent PRs: show last 2 personal records with exercise name and weight
   - "Start Quick Workout" and "From Template" buttons

2. AI Workout Tip (Pro feature):
   - After workout completion, call Claude API with this prompt:
     "The user just completed a [workout_name] workout: [exercise_list]. Their goal is [user_goal]. Give them ONE specific, practical tip in 2 sentences to improve their next session. Be encouraging but specific. No generic advice."
   - Display tip in a card on the Workout Summary screen
   - Store tip locally so it can be viewed again

3. App-wide Polish:
   - Add loading shimmer effects on all list screens
   - Add haptic feedback on set completion checkmark
   - Add confetti animation on new PR achievement
   - Smooth page transitions: use Hero animations on exercise images
   - Empty state illustrations on History and PRs screens
   - Onboarding tooltips on first use of Active Workout screen
   - App icon: use a dumbbell with lightning bolt design

4. Performance:
   - Lazy load exercise library
   - Paginate workout history (load 20 at a time)
   - Compress any workout images before storage

WEEK 8 PROMPT — TESTING + PLAY STORE BUILD
Prepare FitLog Pro for Play Store submission:

1. Generate a signed release APK / AAB:
   keytool -genkey -v -keystore fitlogpro.jks -keyAlias fitlogpro -keyalg RSA -keysize 2048 -validity 10000
   flutter build appbundle --release

2. Replace all test Ad Unit IDs with real Google AdMob IDs

3. Final testing checklist (test on physical Android device):
   - Complete onboarding flow start to finish
   - Log a full workout with 5 exercises
   - Verify rest timer starts automatically
   - Verify PR is detected and badge shown
   - Test offline mode: turn off WiFi and log a workout — should save to Hive
   - Turn WiFi back on — should sync to Firestore
   - Test Pro paywall appears on locked features
   - Test Google Sign-In
   - Test app restart: all data should persist
   - Test app on Android 10, 11, 12, 13, 14

4. Create Play Store listing assets:
   - App icon: 512×512 PNG — transparent background
   - Feature graphic: 1024×500 PNG — professional banner
   - Screenshots: minimum 8 screenshots of key screens
   - Short description (80 characters): "Track workouts, crush PRs, and see your progress"
   - Full description: keyword-rich, 4000 characters
   - Privacy policy URL: publish a simple privacy policy page
   - Content rating: complete the questionnaire (Health & Fitness — no medical advice)

12. Build Timeline

Week
Focus
Deliverable
AI Tool Used
Week 1
Project Setup + Onboarding
9 onboarding screens — full flow working
Claude.ai + VS Code
Week 2
Exercise Library + Templates
Exercise search + 5 pre-built templates
Claude.ai + VS Code
Week 3
Active Workout + Rest Timer
Full workout logging + rest timer + summary
Claude.ai + VS Code
Week 4
History + Progress Charts
Calendar history + 4 progress screens
Claude.ai + VS Code + fl_chart
Week 5
Profile + Achievements + Settings
Profile + 20 badges + full settings
Claude.ai + VS Code
Week 6
Firebase + Paywall + Ads
Auth + sync + AdMob + Play Billing
Claude.ai + Firebase Console
Week 7
Polish + Home + AI Tips
Final UI polish + animations + AI tips
Claude.ai + Claude API
Week 8
Testing + Play Store
Signed AAB + Play Store listing live
Claude.ai + Android Studio

13. Play Store Launch Checklist

Item
Spec
Status
App Icon
512×512 PNG — no transparent background on icon itself
⬜ To Do
Feature Graphic
1024×500 PNG — hero banner for Play Store
⬜ To Do
Phone Screenshots
Min 4, max 8 — 1080×1920 or 1440×2560 PNG/JPEG
⬜ To Do
Short Description
Max 80 characters — keyword-rich
⬜ To Do
Full Description
Max 4000 characters — features, benefits, keywords
⬜ To Do
Privacy Policy URL
Required — must be hosted publicly (use GitHub Pages)
⬜ To Do
Content Rating
Complete IARC questionnaire in Play Console
⬜ To Do
Target Audience
Everyone (no age restriction needed)
⬜ To Do
Developer Account
$25 one-time fee at play.google.com/console
⬜ To Do
Signed AAB
flutter build appbundle --release
⬜ To Do
Firebase Rules
Set Firestore security rules — users can only access own data
⬜ To Do
AdMob App ID
Replace test IDs with real IDs from AdMob console
⬜ To Do
Crash-Free Test
Test full workflow on 3 physical Android devices
⬜ To Do
Offline Test
Verify app works fully with WiFi off
⬜ To Do
Review Checklist
Read Google Play Developer Policy before submission
⬜ To Do

14. Copyright & Legal Compliance

FitLog Pro is built from scratch using original code and content. The following compliance guidelines must be followed throughout development:

14.1 What You Own (Original Work)
All Flutter/Dart code written using Claude.ai is your original work — AI-generated code has no copyright restrictions
All UI designs created in the app are original — do not copy screenshots from competitors
App name "FitLog Pro" — search Play Store and trademark databases before publishing to confirm it is not taken
All exercise instructions must be written originally — do not copy from competitor apps or fitness websites

14.2 Assets — What to Use and What to Avoid
Asset Type
Safe Source
Avoid
Icons
Flutter Icons package (Material), Phosphor Icons (MIT license)
Copying icons from other apps
Illustrations
unDraw.co (free, no attribution needed), Storyset (free)
Copying from Fitbod, Hevy, Strong
Exercise GIFs/Images
Create original descriptions only (no images in v1)
Exercisedb.dev images — check license
Fonts
Google Fonts (all open source) — use Poppins or Inter
Paid fonts without license
Color schemes
Your own color palette — no trademark colors
Exact copies of competitor palettes
Music/Sounds
Freesound.org (CC0 license) for timer sounds
Any copyrighted audio

14.3 Exercise Database — Original Content
Write all 300 exercise names and instructions originally. Exercise names themselves are not copyrightable (e.g. "Barbell Bench Press" is a generic term). However, the specific description of how to perform it must be your own writing. Use Claude.ai to generate original exercise instructions:

Claude.ai prompt: "Write an original, clear, 3-sentence instruction for how to perform a Barbell Bench Press. Focus on setup, execution, and safety. Write in simple language for beginners. Do not copy from any existing source."

14.4 Required Legal Pages in the App
Page
Required?
What It Must Say
Privacy Policy
✅ Mandatory for Play Store
What data you collect (name, email, workout data), how it is stored (Firebase), how users can delete their data
Terms of Service
✅ Recommended
User responsibilities, subscription terms, refund policy (Google Play handles refunds)
Subscription Terms
✅ For billing
Auto-renewal disclosure, cancellation instructions, price clearly stated
Health Disclaimer
✅ Recommended
"This app is not a substitute for professional medical advice. Consult a doctor before starting any exercise program."

15. Revenue Projections

Conservative projections based on similar solo-built fitness apps with a genuine free tier and India-first pricing.

Month
Total Downloads
Active Users
Pro Users (5%)
Ad Revenue
Subscription Revenue
Total MRR
Month 1
500
300
15 users
₹500
₹2,235
₹2,735
Month 2
1,200
700
35 users
₹1,200
₹5,215
₹6,415
Month 3
2,500
1,500
75 users
₹2,500
₹11,175
₹13,675
Month 6
8,000
4,800
240 users
₹8,000
₹35,760
₹43,760
Month 9
18,000
11,000
550 users
₹18,000
₹81,950
₹99,950
Month 12
30,000
18,000
900 users
₹30,000
₹1,34,100
₹1,64,100
Month 18
60,000
36,000
1,800 users
₹60,000
₹2,68,200
₹3,28,200

Note: Pro user conversion rate assumed at 5% of active users. Average plan value: ₹149/month. Ad eCPM assumed at ₹5 per 1,000 impressions for India traffic.

15.1 Path to ₹1 Lakh MRR
Milestone
Target
Timeline
First paid subscriber
1 Pro user
Week 1 after launch
₹10,000 MRR
~70 Pro users
Month 2–3
₹50,000 MRR
~340 Pro users
Month 5–6
₹1,00,000 MRR
~670 Pro users
Month 8–10
₹3,00,000 MRR
~2,000 Pro users
Month 15–18

— End of Specification Document —
FitLog Pro v1.0 Spec  |  Tabor Synergy  |  October 2026
Confidential — Internal Use Only