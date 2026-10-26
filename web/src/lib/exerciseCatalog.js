// Extra exercises merged into CASCADING_CATEGORIES by exercises.js.
// Growth scores are editorial estimates (7.5 to 9.6) of muscle stimulus per unit of fatigue and joint
// strain. They are a ranking aid, not measured data.
// Row: [subregionId, id, name, equipment, score, targetMuscle, cue]

/** Sub-regions that do not exist in the base library: [categoryId, { id, name, plainName, description }] */
export const NEW_SUBREGIONS = [
  ['legs', { id: 'calves', name: 'Calves', plainName: 'Calves (Lower Leg)', description: 'Lower-leg size and ankle strength.' }],
  ['back', { id: 'lower_back', name: 'Lower Back', plainName: 'Lower Back & Spinal Support', description: 'Strong, resilient lower back for heavy lifting.' }],
  ['arms', { id: 'forearms', name: 'Forearms', plainName: 'Forearms & Grip', description: 'Grip strength and forearm size.' }],
];

export const CATALOG = [
  // Chest
  ['upper_chest', 'incline_barbell_press', 'Incline Barbell Press', 'Barbell', 9.0, 'Upper Chest', 'Bench at 30 degrees. Lower the bar to your upper chest, press straight up.'],
  ['upper_chest', 'incline_machine_press', 'Incline Machine Press', 'Machine', 9.0, 'Upper Chest', 'Set the seat so handles start at upper-chest height. Press without shrugging.'],
  ['upper_chest', 'incline_pushup', 'Incline Push-Up', 'Bodyweight', 8.0, 'Upper Chest', 'Hands on a bench or box, body in one straight line, chest to the edge.'],
  ['mid_lower_chest', 'db_bench_press', 'Dumbbell Bench Press', 'Dumbbells', 9.4, 'Middle Chest', 'Lower until elbows are just below the bench, press up and slightly together.'],
  ['mid_lower_chest', 'pec_deck_fly', 'Pec Deck Fly', 'Machine', 9.2, 'Middle Chest', 'Slight bend in the elbows, squeeze the handles together in front of your chest.'],
  ['mid_lower_chest', 'cable_crossover', 'Cable Crossover', 'Cable', 9.1, 'Mid & Lower Chest', 'Step forward, hug the cables down and across, pause when your hands meet.'],
  ['mid_lower_chest', 'pushup', 'Push-Up', 'Bodyweight', 8.6, 'Chest & Triceps', 'Body in a straight line, chest touches the floor, elbows about 45 degrees from your body.'],
  ['mid_lower_chest', 'decline_bench_press', 'Decline Bench Press', 'Barbell', 8.8, 'Lower Chest', 'Lower the bar to your lower chest under control, press without bouncing.'],
  // Back: lats
  ['lats', 'pullup', 'Pull-Up', 'Pull-up Bar', 9.2, 'Lats', 'Start from a full hang, pull your chest toward the bar, lower slowly.'],
  ['lats', 'chinup', 'Chin-Up', 'Pull-up Bar', 9.0, 'Lats & Biceps', 'Palms facing you, pull until your chin clears the bar, control the way down.'],
  ['lats', 'assisted_pullup', 'Assisted Pull-Up', 'Machine', 8.6, 'Lats', 'Use just enough assistance to finish each rep with a full stretch at the bottom.'],
  ['lats', 'straight_arm_pulldown', 'Straight-Arm Pulldown', 'Cable', 8.8, 'Lats', 'Arms nearly straight, sweep the bar to your thighs, feel your lats squeeze.'],
  ['lats', 'db_row', 'One-Arm Dumbbell Row', 'Dumbbells', 9.2, 'Lats & Mid Back', 'Hand on a bench, pull the dumbbell toward your hip, not your shoulder.'],
  ['lats', 'machine_pulldown', 'Machine Pulldown', 'Machine', 9.0, 'Lats', 'Lean back slightly, pull the handles to upper chest, let the stretch happen at the top.'],
  // Back: upper back
  ['upper_back', 'barbell_row', 'Barbell Row', 'Barbell', 9.0, 'Mid Back & Lats', 'Hinge to about 45 degrees, flat back, pull the bar to your lower ribs.'],
  ['upper_back', 'inverted_row', 'Inverted Row', 'Bodyweight', 8.5, 'Mid Back', 'Body straight under a bar, pull your chest to the bar, squeeze shoulder blades.'],
  ['upper_back', 'db_shrug', 'Dumbbell Shrug', 'Dumbbells', 8.4, 'Upper Traps', 'Lift shoulders straight up toward your ears, pause, lower slowly. No rolling.'],
  ['upper_back', 'machine_row', 'Machine Row', 'Machine', 9.0, 'Mid Back', 'Chest on the pad, pull elbows back past your torso, pause and return slowly.'],
  // Back: lower back
  ['lower_back', 'deadlift', 'Conventional Deadlift', 'Barbell', 8.2, 'Back, Glutes & Hamstrings', 'Bar over mid-foot, flat back, push the floor away. High fatigue, so keep reps low.'],
  ['lower_back', 'rack_pull', 'Rack Pull', 'Barbell', 8.3, 'Upper & Lower Back', 'Bar at knee height on pins, stand tall, lock out with your glutes.'],
  ['lower_back', 'hyperextension', 'Back Extension', 'Bodyweight', 8.3, 'Lower Back & Glutes', 'Hinge at the hips, rise until your body is straight. Do not over-arch.'],
  ['lower_back', 'good_morning', 'Good Morning', 'Barbell', 8.0, 'Lower Back & Hamstrings', 'Bar on your back, soft knees, hinge until torso is near parallel, stand tall.'],
  // Legs: quads
  ['quads', 'front_squat', 'Front Squat', 'Barbell', 8.9, 'Quads', 'Elbows high, bar on front shoulders, sit straight down between your knees.'],
  ['quads', 'goblet_squat', 'Goblet Squat', 'Dumbbells', 8.8, 'Quads & Glutes', 'Hold a dumbbell at your chest, squat deep with an upright torso.'],
  ['quads', 'hack_squat', 'Hack Squat', 'Machine', 9.5, 'Quads', 'Feet low on the platform, lower deep, drive through mid-foot.'],
  ['quads', 'bulgarian_split_squat', 'Bulgarian Split Squat', 'Dumbbells', 9.3, 'Quads & Glutes', 'Rear foot on a bench, drop straight down, front knee tracks over your toes.'],
  ['quads', 'walking_lunge', 'Walking Lunge', 'Dumbbells', 8.7, 'Quads & Glutes', 'Long steps, back knee lightly touches the floor, stay tall.'],
  ['quads', 'step_up', 'Dumbbell Step-Up', 'Dumbbells', 8.3, 'Quads & Glutes', 'Whole foot on the box, drive up with the front leg only, lower slowly.'],
  ['quads', 'smith_squat', 'Smith Machine Squat', 'Smith Machine', 8.8, 'Quads', 'Feet slightly forward of the bar, sit down and back, keep your whole foot planted.'],
  ['quads', 'bodyweight_squat', 'Bodyweight Squat', 'Bodyweight', 7.8, 'Quads & Glutes', 'Feet shoulder width, sit between your hips, knees in line with toes.'],
  ['quads', 'sissy_squat', 'Sissy Squat', 'Bodyweight', 8.4, 'Quads', 'Lean back as your knees travel forward, hold something for balance.'],
  // Legs: hamstrings and glutes
  ['hamstrings_glutes', 'lying_leg_curl', 'Lying Leg Curl', 'Machine', 9.4, 'Hamstrings', 'Hips pressed into the pad, curl heels to glutes, lower for three seconds.'],
  ['hamstrings_glutes', 'db_rdl', 'Dumbbell Romanian Deadlift', 'Dumbbells', 9.0, 'Hamstrings & Glutes', 'Push hips back, dumbbells slide down your thighs, feel a hamstring stretch.'],
  ['hamstrings_glutes', 'glute_bridge', 'Glute Bridge', 'Bodyweight', 8.2, 'Glutes', 'Feet flat, push through heels, squeeze your glutes hard at the top.'],
  ['hamstrings_glutes', 'cable_pull_through', 'Cable Pull-Through', 'Cable', 8.8, 'Glutes & Hamstrings', 'Face away from the cable, hinge back, then drive your hips forward.'],
  ['hamstrings_glutes', 'nordic_curl', 'Nordic Curl', 'Bodyweight', 8.5, 'Hamstrings', 'Anchor your heels, lower your body slowly, catch yourself with your hands.'],
  ['hamstrings_glutes', 'cable_kickback', 'Cable Glute Kickback', 'Cable', 8.3, 'Glutes', 'Kick back and slightly up, squeeze at the top, avoid arching your back.'],
  ['hamstrings_glutes', 'hip_abductor', 'Hip Abductor Machine', 'Machine', 7.9, 'Outer Glutes', 'Lean slightly forward, push your knees out, control the return.'],
  ['hamstrings_glutes', 'hip_adductor', 'Hip Adductor Machine', 'Machine', 7.8, 'Inner Thighs', 'Squeeze your knees together smoothly, do not let the weights slam.'],
  // Legs: calves
  ['calves', 'standing_calf_raise', 'Standing Calf Raise', 'Machine', 9.0, 'Calves', 'Full stretch at the bottom, rise onto your toes, pause one second at the top.'],
  ['calves', 'seated_calf_raise', 'Seated Calf Raise', 'Machine', 9.0, 'Soleus (Deep Calf)', 'Knees bent, lower your heels fully, press up and hold briefly.'],
  ['calves', 'smith_calf_raise', 'Smith Machine Calf Raise', 'Smith Machine', 8.5, 'Calves', 'Balls of your feet on a plate, deep stretch, slow controlled reps.'],
  // Shoulders
  ['side_delts', 'machine_lateral_raise', 'Machine Lateral Raise', 'Machine', 9.0, 'Side Delts', 'Elbows against the pads, lift out to the side, stop around shoulder height.'],
  ['front_rear_delts', 'db_shoulder_press', 'Dumbbell Shoulder Press', 'Dumbbells', 9.0, 'Front & Side Delts', 'Press straight overhead, ribs down, do not lean back.'],
  ['front_rear_delts', 'machine_shoulder_press', 'Machine Shoulder Press', 'Machine', 8.8, 'Front & Side Delts', 'Set the seat so handles start at ear height, press without locking hard.'],
  ['front_rear_delts', 'arnold_press', 'Arnold Press', 'Dumbbells', 8.7, 'All Three Delt Heads', 'Rotate your palms from facing you to facing forward as you press.'],
  ['front_rear_delts', 'front_raise', 'Dumbbell Front Raise', 'Dumbbells', 7.8, 'Front Delts', 'Lift to eye level with soft elbows. Light weight is enough.'],
  ['front_rear_delts', 'rear_delt_fly', 'Rear Delt Fly', 'Dumbbells', 9.0, 'Rear Delts', 'Hinge forward, lift the dumbbells out wide, lead with your elbows.'],
  ['front_rear_delts', 'cable_rear_delt_fly', 'Cable Rear Delt Fly', 'Cable', 9.0, 'Rear Delts', 'Cross the cables, pull them apart to the sides, squeeze your rear shoulders.'],
  ['front_rear_delts', 'pike_pushup', 'Pike Push-Up', 'Bodyweight', 8.2, 'Shoulders', 'Hips high, lower the top of your head toward the floor, press back up.'],
  ['front_rear_delts', 'landmine_press', 'Landmine Press', 'Barbell', 8.3, 'Front Delts & Upper Chest', 'Press the bar end up and forward, keep your ribs stacked over your hips.'],
  // Arms: biceps
  ['biceps', 'barbell_curl', 'Barbell Curl', 'Barbell', 8.9, 'Biceps', 'Elbows at your sides, curl with no swinging, lower slowly.'],
  ['biceps', 'ez_bar_curl', 'EZ-Bar Curl', 'Barbell', 9.0, 'Biceps', 'The angled grip is easier on wrists. Curl up, squeeze, lower for two seconds.'],
  ['biceps', 'preacher_curl', 'Preacher Curl', 'Machine', 9.2, 'Biceps', 'Arms flat on the pad, lower to a full stretch, curl without lifting your elbows.'],
  ['biceps', 'hammer_curl', 'Dumbbell Hammer Curl', 'Dumbbells', 9.0, 'Biceps & Forearms', 'Palms face each other the whole time, no hip swing.'],
  ['biceps', 'concentration_curl', 'Concentration Curl', 'Dumbbells', 8.5, 'Biceps', 'Elbow on your inner thigh, curl slowly, squeeze at the top.'],
  ['biceps', 'spider_curl', 'Spider Curl', 'Dumbbells', 8.9, 'Biceps', 'Chest on an incline bench, arms hanging, curl without swinging.'],
  ['biceps', 'cable_curl', 'Cable Curl', 'Cable', 9.0, 'Biceps', 'Constant tension: keep elbows still and curl to your shoulders.'],
  // Arms: triceps
  ['triceps', 'skullcrusher', 'Skullcrusher', 'Barbell', 9.1, 'Triceps', 'Lower the bar toward your forehead by bending only your elbows, then extend.'],
  ['triceps', 'close_grip_bench', 'Close-Grip Bench Press', 'Barbell', 8.8, 'Triceps & Chest', 'Hands shoulder-width, elbows tucked, press the bar straight up.'],
  ['triceps', 'triceps_pushdown', 'Triceps Pushdown', 'Cable', 8.9, 'Triceps', 'Elbows pinned to your sides, push down until your arms are straight.'],
  ['triceps', 'overhead_db_extension', 'Overhead Dumbbell Extension', 'Dumbbells', 9.1, 'Triceps Long Head', 'Lower the dumbbell behind your head, then extend. Keep elbows pointing forward.'],
  ['triceps', 'dip_machine', 'Machine Dip', 'Machine', 8.8, 'Triceps', 'Press down and slightly back, stop just short of locking out.'],
  ['triceps', 'bench_dip', 'Bench Dip', 'Bodyweight', 7.9, 'Triceps', 'Hands on a bench behind you, lower until elbows reach 90 degrees.'],
  ['triceps', 'db_kickback', 'Dumbbell Kickback', 'Dumbbells', 8.2, 'Triceps', 'Upper arm parallel to the floor, extend your elbow fully, pause.'],
  ['triceps', 'diamond_pushup', 'Diamond Push-Up', 'Bodyweight', 8.2, 'Triceps', 'Hands close under your chest, elbows tight to your body.'],
  // Arms: forearms
  ['forearms', 'wrist_curl', 'Dumbbell Wrist Curl', 'Dumbbells', 7.8, 'Forearm Flexors', 'Forearms on your thighs, curl the weight with just your wrists.'],
  ['forearms', 'reverse_curl', 'Reverse Curl', 'Barbell', 8.4, 'Forearms & Brachialis', 'Overhand grip, curl with strict elbows, lower slowly.'],
  ['forearms', 'farmers_carry', "Farmer's Carry", 'Dumbbells', 8.2, 'Grip & Forearms', 'Heavy dumbbells at your sides, walk tall with short steps.'],
  // Core
  ['abs', 'plank', 'Plank', 'Bodyweight', 8.4, 'Core', 'Elbows under shoulders, glutes tight, body straight. Hold, do not sag.'],
  ['abs', 'ab_wheel', 'Ab Wheel Rollout', 'Bodyweight', 8.9, 'Abs', 'Roll out only as far as you can keep your lower back flat.'],
  ['abs', 'crunch', 'Crunch', 'Bodyweight', 7.9, 'Upper Abs', 'Curl your ribs toward your hips, do not pull on your neck.'],
  ['abs', 'decline_situp', 'Decline Sit-Up', 'Bodyweight', 8.0, 'Abs', 'Controlled rise with arms crossed, avoid yanking with momentum.'],
  ['abs', 'cable_woodchop', 'Cable Woodchop', 'Cable', 8.3, 'Obliques', 'Rotate through your torso, not your arms, from high to low.'],
  ['abs', 'side_plank', 'Side Plank', 'Bodyweight', 8.0, 'Obliques', 'Stack your feet, lift your hips, keep a straight line from head to heels.'],
  ['abs', 'dead_bug', 'Dead Bug', 'Bodyweight', 8.2, 'Deep Core', 'Lower back pressed into the floor, extend opposite arm and leg slowly.'],
  ['abs', 'machine_crunch', 'Machine Crunch', 'Machine', 8.5, 'Abs', 'Curl your ribs toward your pelvis, exhale at the bottom.'],
  ['abs', 'pallof_press', 'Pallof Press', 'Cable', 8.3, 'Core Anti-Rotation', 'Press the handle straight out and resist the cable pulling you sideways.'],
];
