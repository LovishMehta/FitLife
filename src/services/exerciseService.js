/**
 * Exercise Service - Mock data for exercises
 * Provides exercise categories and individual exercises
 */
class ExerciseService {
  constructor() {
    this.categories = {
      bodyPart: [
        {
          id: 'arms',
          name: 'Arms',
          icon: 'fitness',
          exerciseCount: 24,
          color: '#4CAF50',
          description: 'Biceps, triceps & forearms',
        },
        {
          id: 'chest',
          name: 'Chest',
          icon: 'body',
          exerciseCount: 18,
          color: '#2196F3',
          description: 'Pectorals & upper chest',
        },
        {
          id: 'core',
          name: 'Core',
          icon: 'radio-button-on',
          exerciseCount: 32,
          color: '#FF9800',
          description: 'Abs, obliques & lower back',
        },
        {
          id: 'back',
          name: 'Back',
          icon: 'arrow-back-circle',
          exerciseCount: 21,
          color: '#9C27B0',
          description: 'Lats, traps & rhomboids',
        },
        {
          id: 'legs',
          name: 'Legs',
          icon: 'walk',
          exerciseCount: 28,
          color: '#E91E63',
          description: 'Quads, hamstrings & calves',
        },
        {
          id: 'glutes',
          name: 'Glutes',
          icon: 'ellipse',
          exerciseCount: 15,
          color: '#00BCD4',
          description: 'Gluteus maximus & medius',
        },
      ],
      equipment: [
        {
          id: 'dumbbells',
          name: 'Dumbbells',
          icon: 'barbell',
          exerciseCount: 45,
          color: '#607D8B',
          description: 'Free weight exercises',
        },
        {
          id: 'barbell',
          name: 'Barbell',
          icon: 'barbell-outline',
          exerciseCount: 32,
          color: '#795548',
          description: 'Compound movements',
        },
        {
          id: 'bodyweight',
          name: 'Bodyweight',
          icon: 'person',
          exerciseCount: 38,
          color: '#4CAF50',
          description: 'No equipment needed',
        },
        {
          id: 'resistance-bands',
          name: 'Bands',
          icon: 'git-compare',
          exerciseCount: 22,
          color: '#FF5722',
          description: 'Resistance band training',
        },
        {
          id: 'machines',
          name: 'Machines',
          icon: 'cog',
          exerciseCount: 28,
          color: '#3F51B5',
          description: 'Gym machine workouts',
        },
        {
          id: 'kettlebell',
          name: 'Kettlebell',
          icon: 'american-football',
          exerciseCount: 18,
          color: '#F44336',
          description: 'Kettlebell swings & more',
        },
      ],
    };

    this.exercises = {
      arms: [
        { id: 1, name: 'Bicep Curls', sets: 3, reps: 12, duration: null },
        { id: 2, name: 'Tricep Dips', sets: 3, reps: 15, duration: null },
        { id: 3, name: 'Hammer Curls', sets: 3, reps: 12, duration: null },
        { id: 4, name: 'Tricep Pushdowns', sets: 3, reps: 15, duration: null },
        { id: 5, name: 'Concentration Curls', sets: 3, reps: 10, duration: null },
      ],
      chest: [
        { id: 1, name: 'Push-Ups', sets: 3, reps: 15, duration: null },
        { id: 2, name: 'Bench Press', sets: 4, reps: 10, duration: null },
        { id: 3, name: 'Incline Press', sets: 3, reps: 12, duration: null },
        { id: 4, name: 'Chest Flyes', sets: 3, reps: 12, duration: null },
      ],
      core: [
        { id: 1, name: 'Plank', sets: 3, reps: null, duration: 60 },
        { id: 2, name: 'Crunches', sets: 3, reps: 20, duration: null },
        { id: 3, name: 'Russian Twists', sets: 3, reps: 20, duration: null },
        { id: 4, name: 'Leg Raises', sets: 3, reps: 15, duration: null },
        { id: 5, name: 'Mountain Climbers', sets: 3, reps: null, duration: 45 },
      ],
      back: [
        { id: 1, name: 'Pull-Ups', sets: 3, reps: 10, duration: null },
        { id: 2, name: 'Lat Pulldowns', sets: 3, reps: 12, duration: null },
        { id: 3, name: 'Bent-Over Rows', sets: 3, reps: 12, duration: null },
        { id: 4, name: 'Deadlifts', sets: 4, reps: 8, duration: null },
      ],
      legs: [
        { id: 1, name: 'Squats', sets: 4, reps: 12, duration: null },
        { id: 2, name: 'Lunges', sets: 3, reps: 12, duration: null },
        { id: 3, name: 'Leg Press', sets: 3, reps: 15, duration: null },
        { id: 4, name: 'Calf Raises', sets: 3, reps: 20, duration: null },
        { id: 5, name: 'Leg Curls', sets: 3, reps: 12, duration: null },
      ],
      glutes: [
        { id: 1, name: 'Hip Thrusts', sets: 3, reps: 15, duration: null },
        { id: 2, name: 'Glute Bridges', sets: 3, reps: 15, duration: null },
        { id: 3, name: 'Donkey Kicks', sets: 3, reps: 15, duration: null },
        { id: 4, name: 'Fire Hydrants', sets: 3, reps: 15, duration: null },
      ],
    };
  }

  /**
   * Get exercise categories by type
   * @param {string} type - 'bodyPart' or 'equipment'
   * @returns {Array} Array of category objects
   */
  getCategories(type = 'bodyPart') {
    return this.categories[type] || this.categories.bodyPart;
  }

  /**
   * Get exercises for a specific category
   * @param {string} categoryId - Category ID
   * @returns {Array} Array of exercise objects
   */
  getExercisesByCategory(categoryId) {
    return this.exercises[categoryId] || [];
  }

  /**
   * Get a single category by ID
   * @param {string} categoryId - Category ID
   * @param {string} type - 'bodyPart' or 'equipment'
   * @returns {Object|null} Category object or null
   */
  getCategoryById(categoryId, type = 'bodyPart') {
    const categories = this.categories[type];
    return categories.find(cat => cat.id === categoryId) || null;
  }

  /**
   * Search exercises by name
   * @param {string} query - Search query
   * @returns {Array} Array of matching exercises
   */
  searchExercises(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    Object.entries(this.exercises).forEach(([categoryId, exercises]) => {
      exercises.forEach(exercise => {
        if (exercise.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            ...exercise,
            categoryId,
          });
        }
      });
    });
    
    return results;
  }

  /**
   * Get total exercise count
   * @returns {number} Total number of exercises
   */
  getTotalExerciseCount() {
    return Object.values(this.exercises).reduce(
      (total, exercises) => total + exercises.length,
      0
    );
  }
}

export default new ExerciseService();

