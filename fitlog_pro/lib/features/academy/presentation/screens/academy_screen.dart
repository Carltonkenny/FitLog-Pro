import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';
import '../../../exercises/domain/entities/exercise.dart';
import '../../../exercises/data/exercise_database.dart';
import '../../../exercises/presentation/widgets/exercise_library_sheet.dart';

class AcademyScreen extends StatefulWidget {
  const AcademyScreen({super.key});

  @override
  State<AcademyScreen> createState() => _AcademyScreenState();
}

class _AcademyScreenState extends State<AcademyScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  MuscleGroup _selectedMuscle = MuscleGroup.chest;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.school, color: FitLogTokens.accent, size: 22),
            SizedBox(width: 8),
            Text(
              'Anatomy & Equipment Academy',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: FitLogTokens.textPrimary,
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: FitLogTokens.accent,
          indicatorWeight: 3,
          labelColor: FitLogTokens.accent,
          unselectedLabelColor: FitLogTokens.textSecondary,
          labelStyle:
              const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Body Anatomy'),
            Tab(text: 'Equipment Decoded'),
            Tab(text: 'Movement Synergies'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAnatomyTab(),
          _buildEquipmentTab(),
          _buildSynergiesTab(),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // TAB 1: BODY ANATOMY & EXERCISE EFFECTS
  // ----------------------------------------------------
  Widget _buildAnatomyTab() {
    final anatomyInfo = _getAnatomyInfo(_selectedMuscle);
    final topExercises =
        ExerciseDatabase.filter(muscleGroup: _selectedMuscle).take(5).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Horizontal Muscle Selector Pills
        SizedBox(
          height: 38,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              for (final mg in MuscleGroup.values) ...[
                GestureDetector(
                  onTap: () => setState(() => _selectedMuscle = mg),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: _selectedMuscle == mg
                          ? FitLogTokens.accent
                          : FitLogTokens.surface,
                      borderRadius:
                          BorderRadius.circular(FitLogTokens.radiusPill),
                      border: Border.all(
                        color: _selectedMuscle == mg
                            ? FitLogTokens.accent
                            : Colors.white12,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        mg.displayName,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _selectedMuscle == mg
                              ? FitLogTokens.onAccent
                              : FitLogTokens.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Anatomy Deep-Dive Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            border: Border.all(color: Colors.white12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _selectedMuscle.displayName.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: FitLogTokens.accent,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: FitLogTokens.surface2,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${ExerciseDatabase.filter(muscleGroup: _selectedMuscle).length} Exercises',
                      style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: FitLogTokens.textSecondary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                _selectedMuscle.anatomicalDescription,
                style: const TextStyle(
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                  color: FitLogTokens.textSecondary,
                ),
              ),
              const SizedBox(height: 14),
              const Divider(color: Colors.white12),
              const SizedBox(height: 10),

              // What It Does To Your Body
              const Row(
                children: [
                  Icon(Icons.fitness_center,
                      color: FitLogTokens.accent, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'WHAT IT DOES TO YOUR BODY',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: FitLogTokens.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                anatomyInfo['action']!,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.4,
                  color: FitLogTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 14),

              // Aesthetic & Postural Benefit
              const Row(
                children: [
                  Icon(Icons.auto_awesome,
                      color: FitLogTokens.prGold, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'REAL-WORLD & AESTHETIC BENEFIT',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: FitLogTokens.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                anatomyInfo['benefit']!,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.4,
                  color: FitLogTokens.textPrimary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Top Recommended Exercises for this Muscle
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'TOP EVIDENCE-BASED EXERCISES',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: FitLogTokens.textSecondary,
              ),
            ),
            TextButton(
              onPressed: () {
                ExerciseLibrarySheet.show(
                  context,
                  onSelect: (ex) {},
                );
              },
              child: const Text('View All in 330+ Library',
                  style: TextStyle(fontSize: 11, color: FitLogTokens.accent)),
            ),
          ],
        ),
        const SizedBox(height: 8),

        for (final ex in topExercises)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ex.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        ex.description,
                        style: const TextStyle(
                          fontSize: 11,
                          color: FitLogTokens.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: FitLogTokens.surface2,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    ex.equipment.displayName,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: FitLogTokens.accent,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  // ----------------------------------------------------
  // TAB 2: EQUIPMENT DECODED
  // ----------------------------------------------------
  Widget _buildEquipmentTab() {
    final equipmentGuides = [
      {
        'title': 'Olympic Barbell',
        'badge': 'MAX MECHANICAL LOAD',
        'desc':
            'Allows the heaviest absolute poundages. Essential for systemic bone density, joint integrity, and overloading compound movement patterns (Bench, Squat, Deadlift, Overhead Press).',
        'idealFor': 'Maximum strength, progressive overload, power development',
      },
      {
        'title': 'Dumbbells',
        'badge': 'UNILATERAL SYMMETRY & FREEDOM',
        'desc':
            'Permits independent arm movement, fixing left-to-right strength discrepancies. Allows natural wrist rotation to eliminate joint impingement and provides deeper loaded stretch at the bottom of reps.',
        'idealFor': 'Hypertrophy, shoulder health, correcting imbalances',
      },
      {
        'title': 'Cable Systems',
        'badge': 'CONTINUOUS RESISTANCE TORQUE',
        'desc':
            'Unlike free weights where gravity drops to near-zero at the top or bottom of a rep, cables maintain smooth, continuous tension across 100% of the movement arc.',
        'idealFor':
            'Peak muscular pump, rotator cuff health, targeted isolations',
      },
      {
        'title': 'Selectorized & Plate Machines',
        'badge': 'FAIL-SAFE STABILITY TO TRUE FAILURE',
        'desc':
            'Locked fixed planes eliminate stabilizer fatigue and balance risk. Lifters can safely push sets beyond failure without fear of dropping weights or needing a spotter.',
        'idealFor': 'Hypertrophy to absolute failure, leg press, hack squats',
      },
      {
        'title': 'Bodyweight & Calisthenics',
        'badge': 'RELATIVE STRENGTH & KINETIC CONTROL',
        'desc':
            'Closed kinetic chain movements (Dips, Pull-Ups, Push-Ups) require whole-body co-contraction, core bracing, and superior neuromuscular motor unit recruitment.',
        'idealFor': 'Relative strength, gymnastic control, shoulder stability',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: equipmentGuides.length,
      itemBuilder: (context, index) {
        final item = equipmentGuides[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            border: Border.all(color: Colors.white12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item['title']!,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: FitLogTokens.textPrimary,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: FitLogTokens.accent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item['badge']!,
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: FitLogTokens.accent,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                item['desc']!,
                style: const TextStyle(
                  fontSize: 12,
                  height: 1.4,
                  color: FitLogTokens.textSecondary,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: FitLogTokens.surface2,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline,
                        size: 14, color: FitLogTokens.accent),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Best for: ${item['idealFor']}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ----------------------------------------------------
  // TAB 3: MOVEMENT SYNERGIES & SUPERSETS
  // ----------------------------------------------------
  Widget _buildSynergiesTab() {
    final synergies = [
      {
        'title': 'Antagonist Supersets (Push + Pull)',
        'pairing': 'e.g., Incline Dumbbell Press + Seated Cable Row',
        'why':
            'While your chest contracts, your back actively relaxes (reciprocal inhibition). Alternating sets cuts workout duration in half without sacrificing single-rep strength.',
      },
      {
        'title': 'Arm Antagonist Pairing',
        'pairing': 'e.g., Bicep Barbell Curl + Triceps Cable Pushdown',
        'why':
            'Pumping blood into both opposing upper arm muscles maximizes joint stability, expands the fascia sheath, and prevents elbow tendinitis.',
      },
      {
        'title': 'Pre-Exhaustion Compound Overload',
        'pairing': 'e.g., Dumbbell Lateral Raise followed by Overhead Press',
        'why':
            'Isolating the side delt first ensures the shoulder fails before your triceps fatigue in the compound press.',
      },
      {
        'title': 'Compound to Isolation Finisher',
        'pairing': 'e.g., Barbell Back Squat followed by Leg Extensions',
        'why':
            'The heavy squat provides dense axial mechanical loading; the leg extension finishes off the rectus femoris in its shortened peak without spinal fatigue.',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: synergies.length,
      itemBuilder: (context, index) {
        final syn = synergies[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            border: Border.all(color: Colors.white12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                syn['title']!,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: FitLogTokens.accent,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                syn['pairing']!,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: FitLogTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                syn['why']!,
                style: const TextStyle(
                  fontSize: 12,
                  height: 1.4,
                  color: FitLogTokens.textSecondary,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Map<String, String> _getAnatomyInfo(MuscleGroup mg) {
    switch (mg) {
      case MuscleGroup.chest:
        return {
          'action':
              'Pushes resistance horizontally away from torso; draws arms inward across the sternum (horizontal adduction).',
          'benefit':
              'Builds thick upper & mid chest armor, pushes shoulders back into alignment, and enhances pressing force.',
        };
      case MuscleGroup.back:
        return {
          'action':
              'Pulls weight towards torso vertically and horizontally; retracts and depresses scapulae.',
          'benefit':
              'Forges the classic aesthetic V-taper, fixes rounded desk shoulders, and armors the spine against lower back strain.',
        };
      case MuscleGroup.shoulders:
        return {
          'action':
              'Elevates arms overhead, horizontally abducts (rear delts), and laterally raises arms away from body.',
          'benefit':
              'Creates broad 3D shoulder caps, widens the upper silhouette in clothing, and protects the rotator cuff.',
        };
      case MuscleGroup.biceps:
        return {
          'action':
              'Flexes elbow joint and actively supinates (rotates outward) the wrist and forearm.',
          'benefit':
              'Delivers sharp arm peak definition, enhances grip endurance, and assists in all heavy compound pulling.',
        };
      case MuscleGroup.triceps:
        return {
          'action':
              'Extends the elbow joint straight; long head extends shoulder backward.',
          'benefit':
              'Makes up 60% of total upper arm mass. Direct power source for bench press and overhead lockouts.',
        };
      case MuscleGroup.quads:
        return {
          'action':
              'Extends the knee joint and absorbs deceleration forces during squats and running.',
          'benefit':
              'Constructs deep front thigh thickness, builds the teardrop vastus medialis, and powers sprinting and jumping.',
        };
      case MuscleGroup.hamstrings:
        return {
          'action':
              'Drives hips forward through hip hinge and flexes knee joint backwards.',
          'benefit':
              'Primary athletic power engine for sprinting, stabilizes the pelvis to prevent lower back pain, and sculpts glutes.',
        };
      case MuscleGroup.calves:
        return {
          'action':
              'Plantar-flexes foot at ankle joint; tibialis dorsiflexes toes upward.',
          'benefit':
              'Absorbs ground impacts, improves ankle stiffness for athletic jumping, and prevents shin splints.',
        };
      case MuscleGroup.core:
        return {
          'action':
              'Resists spinal extension, resists rotation, and transfers power between lower and upper body.',
          'benefit':
              'Cinches the waistline, carves abdominal definition, and builds intra-abdominal pressure to prevent lifting hernias.',
        };
      case MuscleGroup.traps:
        return {
          'action':
              'Elevates and stabilizes shoulder girdle; flexes and grips with fingers and wrist.',
          'benefit':
              'Forges dense upper trap neck yoke and builds crushing grip strength for deadlifts and heavy carries.',
        };
    }
  }
}
