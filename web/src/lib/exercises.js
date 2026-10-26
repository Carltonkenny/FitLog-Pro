import { CATALOG, NEW_SUBREGIONS } from './exerciseCatalog.js';

// Pure data and math: the exercise library and the Epley estimated-max formula.
// No browser, React or network imports, so it runs unchanged in Node tests.

// Helper for 1RM calculation (Epley formula)
export const calculate1RM = (weight, reps) => {
  if (!weight || weight <= 0) return 0;
  if (reps <= 1) return Number(weight);
  // Epley Formula: 1RM = weight * (1 + reps / 30)
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

// ------------------------------------------------------------------------------
// CASCADING EXERCISE DATABASE (Plain English + Growth vs. Fatigue Scores)
// ------------------------------------------------------------------------------
export const CASCADING_CATEGORIES = [
  {
    id: 'chest',
    name: 'Chest',
    plainName: 'Chest (Pecs)',
    subregions: [
      {
        id: 'upper_chest',
        name: 'Upper Chest',
        plainName: 'Upper Chest (Collarbone Area)',
        description: 'Creates a full, armored upper torso profile.',
        exercises: [
          {
            id: 'incline_db_press',
            name: 'Incline Dumbbell Press',
            equipment: 'Dumbbells',
            growthFatigueScore: 9.6, // Plain English rating
            plainRating: 'Exceptional Growth / Low Joint Strain',
            targetMuscle: 'Upper Chest',
            bestAngle: '30° incline bench',
            cue: 'Lower dumbbells until thumbs touch upper chest, press up in a slight arc without clacking weights.',
          },
          {
            id: 'incline_smith_press',
            name: 'Incline Smith Machine Press',
            equipment: 'Smith Machine',
            growthFatigueScore: 9.4,
            plainRating: 'High Growth / Zero Balance Strain',
            targetMuscle: 'Upper Chest',
            bestAngle: '30° incline',
            cue: 'Pure stability lets you push closer to true muscular limit safely.',
          },
          {
            id: 'low_to_high_cable_fly',
            name: 'Low-to-High Cable Fly',
            equipment: 'Cables',
            growthFatigueScore: 8.9,
            plainRating: 'Constant Tension / High Muscle Pump',
            targetMuscle: 'Upper Chest & Inner Tie-in',
            bestAngle: 'Stand upright',
            cue: 'Sweep hands upward and together, squeezing upper chest at chin level.',
          },
        ],
      },
      {
        id: 'mid_lower_chest',
        name: 'Mid & Lower Chest',
        plainName: 'Middle & Lower Chest',
        description: 'Builds primary pushing power and chest thickness.',
        exercises: [
          {
            id: 'bench_press',
            name: 'Barbell Flat Bench Press',
            equipment: 'Barbell',
            growthFatigueScore: 8.8,
            plainRating: 'Maximum Power / Moderate Joint Demand',
            targetMuscle: 'Middle Chest & Triceps',
            bestAngle: 'Flat bench',
            cue: 'Pinch shoulder blades into the bench, touch mid-chest with a 1s controlled pause.',
          },
          {
            id: 'seated_chest_press',
            name: 'Machine Chest Press',
            equipment: 'Machine',
            growthFatigueScore: 9.5,
            plainRating: 'Superior Growth / Safe on Rotator Cuff',
            targetMuscle: 'Entire Chest',
            bestAngle: 'Machine seated',
            cue: 'Adjust seat so handles align with mid-chest; press smoothly.',
          },
          {
            id: 'dips_weighted',
            name: 'Parallel Bar Chest Dips',
            equipment: 'Bodyweight / Belt',
            growthFatigueScore: 9.1,
            plainRating: 'Dense Mass Builder / High Mobility',
            targetMuscle: 'Lower Chest & Shoulders',
            bestAngle: 'Forward torso lean',
            cue: 'Lean forward 30 degrees and flare elbows slightly to target chest over triceps.',
          },
        ],
      },
    ],
  },
  {
    id: 'back',
    name: 'Back',
    plainName: 'Back & Lats',
    subregions: [
      {
        id: 'lats',
        name: 'Lats (V-Taper)',
        plainName: 'Side Back (V-Taper Width)',
        description: 'Creates a wide silhouette and narrow-waist look.',
        exercises: [
          {
            id: 'lat_pulldown',
            name: 'Lat Pulldown (Neutral or Wide Grip)',
            equipment: 'Cable Machine',
            growthFatigueScore: 9.3,
            plainRating: 'High Growth / Very Friendly on Lower Back',
            targetMuscle: 'Lats (Width)',
            bestAngle: 'Vertical pull',
            cue: 'Drive elbows down into your back pockets rather than yanking with hands.',
          },
          {
            id: 'chest_supported_row',
            name: 'Chest-Supported T-Bar Row',
            equipment: 'Machine',
            growthFatigueScore: 9.6,
            plainRating: 'Gold Standard for Muscle Growth',
            targetMuscle: 'Mid-Back & Lats',
            bestAngle: 'Chest pad locked',
            cue: 'Zero spinal fatigue because chest pad supports your upper body.',
          },
          {
            id: 'single_arm_cable_lat_row',
            name: 'Single-Arm Cable Lat Row',
            equipment: 'Cable',
            growthFatigueScore: 9.5,
            plainRating: 'Pinpoint Lat Isolation',
            targetMuscle: 'Lower Lat Fibers',
            bestAngle: 'Seated or kneeling',
            cue: 'Keep arm close to torso, pulling elbow back until it aligns with your hip.',
          },
        ],
      },
      {
        id: 'upper_back',
        name: 'Upper Back & Traps',
        plainName: 'Upper Back & Posture (Thickness)',
        description: 'Improves posture, prevents rounded shoulders, and adds 3D thickness.',
        exercises: [
          {
            id: 'cable_face_pull',
            name: 'Cable Face Pull with Rope',
            equipment: 'Cable',
            growthFatigueScore: 9.7,
            plainRating: 'Shoulder Health & Posture Miracle',
            targetMuscle: 'Rear Shoulders & Upper Back',
            bestAngle: 'Eye level',
            cue: 'Pull rope toward eyes and separate ends, rotating knuckles back.',
          },
          {
            id: 'seated_cable_row',
            name: 'Seated Cable Row (Wide Grip)',
            equipment: 'Cable',
            growthFatigueScore: 9.2,
            plainRating: 'Dense Rhomboid & Trap Builder',
            targetMuscle: 'Mid Back & Upper Traps',
            bestAngle: '45° elbow flare',
            cue: 'Squeeze shoulder blades together for a full 1-second contraction.',
          },
        ],
      },
    ],
  },
  {
    id: 'legs',
    name: 'Legs',
    plainName: 'Legs & Glutes',
    subregions: [
      {
        id: 'quads',
        name: 'Front Thighs (Quads)',
        plainName: 'Front Thighs (Quadriceps)',
        description: 'Powerhouse of knee extension, squatting, and leg size.',
        exercises: [
          {
            id: 'barbell_squat',
            name: 'Barbell Back Squat',
            equipment: 'Barbell',
            growthFatigueScore: 8.5,
            plainRating: 'Massive Whole-Body Strength',
            targetMuscle: 'Quads & Glutes',
            bestAngle: 'Full depth (crease below knee)',
            cue: 'Keep chest upright, push knees forward over toes, drive through midfoot.',
          },
          {
            id: 'leg_press',
            name: '45° Incline Leg Press',
            equipment: 'Machine',
            growthFatigueScore: 9.4,
            plainRating: 'Heavy Quad Loading / Zero Spine Stress',
            targetMuscle: 'Quads',
            bestAngle: 'Feet low & shoulder width',
            cue: 'Lower sled as deep as hips allow without tailbone rounding off pad.',
          },
          {
            id: 'leg_extension',
            name: 'Seated Leg Extension',
            equipment: 'Machine',
            growthFatigueScore: 9.2,
            plainRating: 'Pure Isolated Quad Burn',
            targetMuscle: 'Rectus Femoris (Front Quad)',
            bestAngle: 'Seated',
            cue: 'Lock knees at top for half-second pause, lower smoothly over 2 seconds.',
          },
        ],
      },
      {
        id: 'hamstrings_glutes',
        name: 'Back Thighs & Glutes',
        plainName: 'Hamstrings & Glutes (Posterior Chain)',
        description: 'Protects knees, boosts athletic sprint power, and builds shape.',
        exercises: [
          {
            id: 'romanian_deadlift',
            name: 'Dumbbell / Barbell Romanian Deadlift (RDL)',
            equipment: 'Barbell or Dumbbells',
            growthFatigueScore: 9.3,
            plainRating: 'Deep Hamstring Stretch / High Growth',
            targetMuscle: 'Hamstrings & Glutes',
            bestAngle: 'Hips hinge backward',
            cue: 'Push your butt back toward wall behind you until you feel a deep hamstring stretch.',
          },
          {
            id: 'seated_leg_curl',
            name: 'Seated Hamstring Leg Curl',
            equipment: 'Machine',
            growthFatigueScore: 9.6,
            plainRating: 'Premier Hamstring Growth (Lengthened Position)',
            targetMuscle: 'Hamstrings',
            bestAngle: 'Seated machine',
            cue: 'Lean slightly forward to pre-stretch hamstrings; pull heels back firmly.',
          },
          {
            id: 'hip_thrust',
            name: 'Barbell / Machine Hip Thrust',
            equipment: 'Barbell or Machine',
            growthFatigueScore: 9.4,
            plainRating: 'Direct Glute Power & Shape',
            targetMuscle: 'Glutes',
            bestAngle: 'Bench under shoulder blades',
            cue: 'Tuck chin, drive through heels, lock hips at parallel for 1s squeeze.',
          },
        ],
      },
    ],
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    plainName: 'Shoulders (Delts)',
    subregions: [
      {
        id: 'side_delts',
        name: 'Side Shoulders',
        plainName: 'Side Shoulders (Width & 3D Shape)',
        description: 'Gives the capped, rounded shoulder look that widens your upper body.',
        exercises: [
          {
            id: 'lateral_raise',
            name: 'Dumbbell Lateral Raise',
            equipment: 'Dumbbells',
            growthFatigueScore: 9.1,
            plainRating: 'Essential Side Shoulder Builder',
            targetMuscle: 'Side Delts',
            bestAngle: 'Slight forward lean',
            cue: 'Pour the water: lead with elbows, raise to parallel, avoid shrugging traps.',
          },
          {
            id: 'cable_lateral_raise',
            name: 'Cross-Body Cable Lateral Raise',
            equipment: 'Cable',
            growthFatigueScore: 9.7,
            plainRating: 'Smooth Constant Tension (Top Rated)',
            targetMuscle: 'Side Delts',
            bestAngle: 'Hand behind or in front of body',
            cue: 'Cable provides tension even at the bottom where dumbbells have zero resistance.',
          },
        ],
      },
      {
        id: 'front_rear_delts',
        name: 'Front & Rear Shoulders',
        plainName: 'Front & Rear Shoulders',
        description: 'Balances pressing strength with back-of-shoulder posture.',
        exercises: [
          {
            id: 'overhead_press',
            name: 'Standing Overhead Barbell Press',
            equipment: 'Barbell',
            growthFatigueScore: 8.6,
            plainRating: 'Raw Vertical Strength',
            targetMuscle: 'Front Shoulders & Triceps',
            bestAngle: 'Standing upright',
            cue: 'Squeeze glutes and abs tight, press straight overhead, finish with head through window.',
          },
          {
            id: 'reverse_pec_deck',
            name: 'Reverse Pec Deck (Rear Delt Fly)',
            equipment: 'Machine',
            growthFatigueScore: 9.5,
            plainRating: 'Pure Rear Shoulder Isolation',
            targetMuscle: 'Rear Delts',
            bestAngle: 'Chest against pad',
            cue: 'Keep slight bend in elbows, push handles backward without squeezing shoulder blades.',
          },
        ],
      },
    ],
  },
  {
    id: 'arms',
    name: 'Arms',
    plainName: 'Arms (Biceps & Triceps)',
    subregions: [
      {
        id: 'biceps',
        name: 'Biceps (Front Arm)',
        plainName: 'Front of Arm (Biceps)',
        description: 'Responsible for pulling power and arm peak/thickness.',
        exercises: [
          {
            id: 'bicep_curls',
            name: 'Dumbbell Bicep Curl',
            equipment: 'Dumbbells',
            growthFatigueScore: 9.2,
            plainRating: 'Classic Peak & Supination Builder',
            targetMuscle: 'Biceps',
            bestAngle: 'Standing or seated',
            cue: 'Rotate your pinky upward at the top for maximum bicep contraction.',
          },
          {
            id: 'incline_db_curl',
            name: 'Incline Bench Dumbbell Curl',
            equipment: 'Dumbbells & 45° Bench',
            growthFatigueScore: 9.6,
            plainRating: 'Deep Stretch / High Muscle Fiber Recruitment',
            targetMuscle: 'Bicep Long Head (Peak)',
            bestAngle: '45° incline bench',
            cue: 'Let arms hang straight down behind torso to stretch the bicep before curling.',
          },
          {
            id: 'cable_hammer_curl',
            name: 'Rope Cable Hammer Curl',
            equipment: 'Cable with Rope',
            growthFatigueScore: 9.3,
            plainRating: 'Forearms & Outer Arm Width',
            targetMuscle: 'Brachialis & Forearms',
            bestAngle: 'Palms facing each other',
            cue: 'Keeps wrists neutral to target muscle underneath the bicep that pushes it out.',
          },
        ],
      },
      {
        id: 'triceps',
        name: 'Triceps (Back Arm)',
        plainName: 'Back of Arm (Triceps - 65% of Arm Size)',
        description: 'Makes up two-thirds of upper arm volume and drives pushing strength.',
        exercises: [
          {
            id: 'cable_triceps',
            name: 'Cable Triceps Rope Pushdown',
            equipment: 'Cable with Rope',
            growthFatigueScore: 9.4,
            plainRating: 'Safe, Effective Triceps Builder',
            targetMuscle: 'Triceps Lateral & Medial Heads',
            bestAngle: 'Elbows pinned to ribs',
            cue: 'Keep upper arms motionless; extend elbows and flare rope outward at bottom.',
          },
          {
            id: 'overhead_cable_extension',
            name: 'Overhead Cable Triceps Extension',
            equipment: 'Cable with Rope',
            growthFatigueScore: 9.6,
            plainRating: 'Long Head Stretch (Maximum Growth)',
            targetMuscle: 'Triceps Long Head',
            bestAngle: 'Face away from cable',
            cue: 'Let hands bend behind head for full stretch, then extend forward.',
          },
        ],
      },
    ],
  },
  {
    id: 'core',
    name: 'Core',
    plainName: 'Core & Abs',
    subregions: [
      {
        id: 'abs',
        name: 'Six-Pack & Stability',
        plainName: 'Front Abs & Midsection',
        description: 'Tones the waistline and shields the spine during heavy lifts.',
        exercises: [
          {
            id: 'cable_crunch',
            name: 'Kneeling Cable Crunch',
            equipment: 'Cable with Rope',
            growthFatigueScore: 9.5,
            plainRating: 'Progressively Overloadable Ab Builder',
            targetMuscle: 'Upper & Lower Abs',
            bestAngle: 'Kneeling',
            cue: 'Round your spine like crunching an accordion, bring elbows to thighs.',
          },
          {
            id: 'hanging_leg_raise',
            name: 'Hanging Knee / Leg Raise',
            equipment: 'Pull-up Bar',
            growthFatigueScore: 9.1,
            plainRating: 'Lower Ab & Hip Flexor Strength',
            targetMuscle: 'Lower Abs',
            bestAngle: 'Hanging vertical',
            cue: 'Curl pelvis upward toward your chest rather than just swinging legs.',
          },
        ],
      },
    ],
  },
];

// Merge the extended catalog (see exerciseCatalog.js) into the drill-down structure.
const ratingFor = (score) =>
  score >= 9.4 ? 'Exceptional growth / low joint strain'
  : score >= 9.0 ? 'Very high growth for the effort'
  : score >= 8.5 ? 'Strong growth'
  : 'Good growth';

NEW_SUBREGIONS.forEach(([categoryId, sub]) => {
  CASCADING_CATEGORIES.find((c) => c.id === categoryId).subregions.push({ ...sub, exercises: [] });
});
CATALOG.forEach(([subregionId, id, name, equipment, score, targetMuscle, cue]) => {
  const sub = CASCADING_CATEGORIES.flatMap((c) => c.subregions).find((s) => s.id === subregionId);
  sub.exercises.push({
    id, name, equipment, growthFatigueScore: score, plainRating: ratingFor(score),
    targetMuscle, bestAngle: 'Standard setup', cue,
  });
});

// Flat list helper for quick lookups
export const EXERCISE_LIBRARY = CASCADING_CATEGORIES.flatMap((c) =>
  c.subregions.flatMap((s) =>
    s.exercises.map((ex) => ({
      ...ex,
      muscle: c.name,
      subregion: s.name,
    }))
  )
);
