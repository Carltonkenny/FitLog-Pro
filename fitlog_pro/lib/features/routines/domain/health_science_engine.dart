/// Biological sex profiles for exercise science guidelines.
enum BiologicalSex { male, female }

/// Core training objectives based on sports science & medicine.
enum FitnessGoal {
  hypertrophy,
  maximumStrength,
  metabolicFatLoss,
  jointHealthAndLongevity,
}

/// Clinical & evidence-based training prescription.
final class HealthScienceRecommendation {
  final String title;
  final String physiologicalRationale;
  final String evidenceCitation;
  final int recommendedWeeklySetsPerMuscle;
  final String targetRepRange;
  final int recommendedRestSeconds;
  final List<String> recommendedExercises;
  final List<String> biomechanicalGuidelines;

  const HealthScienceRecommendation({
    required this.title,
    required this.physiologicalRationale,
    required this.evidenceCitation,
    required this.recommendedWeeklySetsPerMuscle,
    required this.targetRepRange,
    required this.recommendedRestSeconds,
    required this.recommendedExercises,
    required this.biomechanicalGuidelines,
  });
}

/// Dynamic Health & Physiological Recommendation Engine.
///
/// Implements clinical exercise science consensus (ACSM, Schoenfeld, Contreras, WHO)
/// to dynamically calculate routine structures based on biological sex and goals.
abstract final class HealthScienceEngine {
  static HealthScienceRecommendation getBlueprint({
    required BiologicalSex sex,
    required FitnessGoal goal,
  }) {
    switch (goal) {
      case FitnessGoal.hypertrophy:
        if (sex == BiologicalSex.male) {
          return const HealthScienceRecommendation(
            title: 'Hypertrophy Power Split (Male Profile)',
            physiologicalRationale:
                'Higher proportion of glycolytic Type II fibers responds strongly to high mechanical tension and compound overload. Targeted progressive overload drives myofibrillar protein synthesis.',
            evidenceCitation:
                'ACSM Position Stand (2021) & Schoenfeld et al. Dose-Response Hypertrophy Meta-Analysis.',
            recommendedWeeklySetsPerMuscle: 14,
            targetRepRange: '8 – 12 reps',
            recommendedRestSeconds: 90,
            recommendedExercises: [
              'Barbell Bench Press (4 sets × 8-10 reps)',
              'Incline Dumbbell Press (3 sets × 10-12 reps)',
              'Barbell Bent-Over Row (4 sets × 8-10 reps)',
              'Overhead Dumbbell Extension (3 sets × 12 reps)',
              'Lateral Raises (3 sets × 15 reps)',
            ],
            biomechanicalGuidelines: [
              'Focus on 2-second eccentric lowering to maximize micro-tears.',
              'Maintain 90-120s rest on compound lifts to replenish ATP-CP pools.',
              'Target RIR (Reps in Reserve) of 1-2 on working sets.',
            ],
          );
        } else {
          return const HealthScienceRecommendation(
            title: 'Endurance Hypertrophy & Toning (Female Profile)',
            physiologicalRationale:
                'Greater proportion of oxidative Type I fibers provides superior fatigue resistance and faster intra-set substrate recovery. Estrogen offers muscle membrane stabilization, supporting higher training density.',
            evidenceCitation:
                'Hunter (2014) Sex Differences in Muscle Fatigue & Contreras et al. Glute/Posterior Biomechanics.',
            recommendedWeeklySetsPerMuscle: 16,
            targetRepRange: '10 – 15 reps',
            recommendedRestSeconds: 60,
            recommendedExercises: [
              'Barbell Hip Thrust (4 sets × 10-12 reps)',
              'Romanian Deadlift (3 sets × 10-12 reps)',
              'Dumbbell Shoulder Press (3 sets × 12 reps)',
              'Lat Pulldown (3 sets × 12 reps)',
              'Cable Glute Kickbacks (3 sets × 15 reps)',
            ],
            biomechanicalGuidelines: [
              'Posterior chain focus to balance knee Q-angle and protect ACL ligaments.',
              '60-75s rest intervals capitalize on rapid Type I oxidative clearance.',
              'Full range of motion to promote tendon stiffness and joint elasticity.',
            ],
          );
        }

      case FitnessGoal.maximumStrength:
        return HealthScienceRecommendation(
          title: sex == BiologicalSex.male
              ? 'Heavy Axial Strength Split (Male)'
              : 'Structural Power & Bone Loading (Female)',
          physiologicalRationale: sex == BiologicalSex.male
              ? 'Maximizes motor unit recruitment and high-threshold neuromuscular firing rates. Demands full phosphocreatine replenishment.'
              : 'Axial mechanical loading provides crucial osteogenic stimulus to maximize bone mineral density and hip/spinal structural integrity.',
          evidenceCitation:
              'National Strength & Conditioning Association (NSCA) Guidelines on Heavy Resistance Training.',
          recommendedWeeklySetsPerMuscle: 12,
          targetRepRange: '3 – 6 reps',
          recommendedRestSeconds: 150,
          recommendedExercises: sex == BiologicalSex.male
              ? [
                  'Barbell Back Squat (5 sets × 4 reps)',
                  'Barbell Bench Press (5 sets × 5 reps)',
                  'Conventional Deadlift (3 sets × 3 reps)',
                  'Standing Overhead Press (4 sets × 5 reps)',
                ]
              : [
                  'Barbell Back Squat (4 sets × 5 reps)',
                  'Trap Bar Deadlift (4 sets × 5 reps)',
                  'Dumbbell Flat Bench Press (4 sets × 6 reps)',
                  'Neutral Grip Lat Pulldown (3 sets × 6 reps)',
                ],
          biomechanicalGuidelines: [
            '2 to 3 minutes rest between working sets is mandatory for CNS recovery.',
            'Maintain strict neutral spine with intra-abdominal bracing.',
            'Never train to absolute mechanical failure on axial spine-loaded lifts.',
          ],
        );

      case FitnessGoal.metabolicFatLoss:
        return const HealthScienceRecommendation(
          title: 'Metabolic Conditioning & Caloric Density',
          physiologicalRationale:
              'Elevates post-exercise oxygen consumption (EPOC) while preserving lean tissue mass via high-density compound resistance work.',
          evidenceCitation:
              'World Health Organization (WHO) Guidelines on Physical Activity & Sedentary Behaviour.',
          recommendedWeeklySetsPerMuscle: 18,
          targetRepRange: '12 – 15 reps',
          recommendedRestSeconds: 45,
          recommendedExercises: [
            'Goblet Squats (4 sets × 15 reps)',
            'Push-Ups / Incline Press (3 sets × 15 reps)',
            'Kettlebell Swings / Romanian Deadlift (4 sets × 15 reps)',
            'Seated Cable Rows (3 sets × 12 reps)',
            'Plank to Mountain Climbers (3 sets × 45s)',
          ],
          biomechanicalGuidelines: [
            'Short rest intervals (45-60s) keep heart rate in Zone 3/4.',
            'Compound multi-joint movements burn 40% more calories than isolation work.',
            'Prioritize steady breathing rhythm throughout execution.',
          ],
        );

      case FitnessGoal.jointHealthAndLongevity:
        return const HealthScienceRecommendation(
          title: 'Joint Armor & Longevity Foundation',
          physiologicalRationale:
              'Enhances synovial fluid circulation, capsular strength, and postural chain endurance without excessive compressive spinal wear.',
          evidenceCitation:
              'Harvard Medical School Special Health Report on Strength Training & Joint Mobility.',
          recommendedWeeklySetsPerMuscle: 12,
          targetRepRange: '10 – 12 reps',
          recommendedRestSeconds: 60,
          recommendedExercises: [
            'Dumbbell Chest Supported Row (3 sets × 12 reps)',
            'Leg Press (Controlled 3s Eccentric) (3 sets × 12 reps)',
            'Cable Face Pulls (4 sets × 15 reps)',
            'Dumbbell Step-Ups (3 sets × 10 reps each leg)',
            'Dead Hangs / Core Bracing (3 sets × 30-45s)',
          ],
          biomechanicalGuidelines: [
            'Strict 3-second lowering tempo protects connective tissue.',
            'Zero grinding or joint pain — pain is a stop signal.',
            'Rotator cuff and scapular stabilization on all upper-body days.',
          ],
        );
    }
  }
}
