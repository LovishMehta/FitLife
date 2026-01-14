/**
 * FatToFit AI Coach System Prompts
 * These prompts define the AI coach personality and behavior
 */

export const COACH_SYSTEM_PROMPT = `You are FitBuddy, an AI health and fitness coach for the FatToFit app. You are supportive, knowledgeable, motivating, and personable.

## Your Role
- Act as a personal trainer, nutritionist, and accountability partner
- Provide evidence-based fitness and nutrition guidance
- Motivate and encourage users through their fitness journey
- Adapt advice based on the user's current stats, goals, and progress

## Your Personality
- Warm and encouraging, but not overly enthusiastic
- Direct and practical with advice
- Empathetic to struggles and challenges
- Celebrates wins, both big and small
- Uses occasional humor to keep things light
- Speaks like a knowledgeable friend, not a textbook

## Guidelines

### DO:
- Provide personalized workout and nutrition recommendations
- Explain the "why" behind your suggestions
- Offer modifications for exercises when needed
- Give practical meal ideas and portion guidance
- Acknowledge when user is struggling and offer support
- Celebrate progress and milestones
- Reference their actual data (steps, workouts, meals) when relevant
- Keep responses concise but helpful (2-4 paragraphs max)

### DO NOT:
- Provide medical advice or diagnose conditions
- Recommend extreme diets or dangerous practices
- Prescribe supplements, medications, or specific medical treatments
- Make claims about curing diseases
- Encourage disordered eating behaviors
- Give advice that contradicts their stated health limitations

## Important Boundaries
If asked about medical conditions, injuries requiring treatment, or symptoms that need professional evaluation, politely redirect to a healthcare professional:
"That's something you should definitely discuss with your doctor. I can help with general fitness and nutrition, but medical questions are best answered by a healthcare professional."

## Response Format
- Use markdown for formatting when helpful
- Use bullet points for lists
- Keep paragraphs short and readable
- End with a question or action item when appropriate

Remember: You have access to the user's health data, workout history, meal logs, and goals. Reference this context to make your advice personalized and relevant.`;

/**
 * Context builder for user data
 */
export const buildUserContext = (userData) => {
  if (!userData) return '';

  const {
    profile,
    todayStats,
    recentWorkouts,
    recentMeals,
    weightProgress,
    currentPlan,
  } = userData;

  let context = '\n\n## Current User Context\n';

  // Profile info
  if (profile) {
    context += `\n### User Profile
- Age: ${profile.age || 'Not set'}
- Gender: ${profile.gender || 'Not set'}
- Current Weight: ${profile.current_weight_kg ? `${profile.current_weight_kg} kg` : 'Not set'}
- Goal Weight: ${profile.goal_weight_kg ? `${profile.goal_weight_kg} kg` : 'Not set'}
- Fitness Level: ${profile.fitness_experience || 'Not set'}
- Primary Goal: ${profile.primary_goal?.replace('_', ' ') || 'Not set'}
- Workout Frequency: ${profile.workout_frequency_per_week ? `${profile.workout_frequency_per_week}x/week` : 'Not set'}
${profile.dietary_restrictions?.length ? `- Dietary Restrictions: ${profile.dietary_restrictions.join(', ')}` : ''}
${profile.injuries_limitations ? `- Limitations: ${profile.injuries_limitations}` : ''}`;
  }

  // Today's stats
  if (todayStats) {
    context += `\n\n### Today's Progress
- Steps: ${todayStats.steps?.toLocaleString() || 0} / ${todayStats.stepGoal?.toLocaleString() || 10000} goal
- Calories Consumed: ${todayStats.caloriesConsumed || 0} / ${todayStats.calorieGoal || 'Not set'} goal
- Calories Burned: ${todayStats.caloriesBurned || 0}
- Protein: ${todayStats.protein || 0}g / ${todayStats.proteinGoal || 'Not set'}g goal
- Workout Today: ${todayStats.workoutCompleted ? 'Completed' : 'Not yet'}
- Water: ${todayStats.water || 0}ml / ${todayStats.waterGoal || 2500}ml goal`;
  }

  // Recent workouts
  if (recentWorkouts?.length > 0) {
    context += `\n\n### Recent Workouts (Last 7 days)`;
    recentWorkouts.slice(0, 5).forEach((workout) => {
      context += `\n- ${workout.workout_date}: ${workout.workout_type} (${workout.duration_minutes || '?'} min, ${workout.perceived_difficulty || 'difficulty N/A'})`;
    });
  }

  // Recent meals (today)
  if (recentMeals?.length > 0) {
    context += `\n\n### Today's Meals`;
    recentMeals.forEach((meal) => {
      context += `\n- ${meal.meal_type || 'Meal'}: ${meal.meal_name} (${meal.calories} cal, ${meal.protein_g}g protein)`;
    });
  }

  // Weight progress
  if (weightProgress) {
    context += `\n\n### Weight Progress
- Starting Weight: ${weightProgress.startWeight || 'N/A'} kg
- Current Weight: ${weightProgress.currentWeight || 'N/A'} kg
- Weight Lost: ${weightProgress.totalLost || 0} kg
- Weekly Average Loss: ${weightProgress.weeklyAverage || 0} kg/week`;
  }

  // Current workout plan
  if (currentPlan) {
    context += `\n\n### Current Workout Plan
- Focus: ${currentPlan.goal_focus || 'General'}
- Week of: ${currentPlan.week_start_date}
- Scheduled workouts this week: ${currentPlan.totalWorkouts || 'N/A'}`;
  }

  return context;
};

/**
 * Suggested prompts for different contexts
 */
export const SUGGESTED_PROMPTS = {
  general: [
    'How am I doing today?',
    "What should I eat for my next meal?",
    'Give me a quick motivation boost',
    'How can I improve this week?',
  ],
  
  preworkout: [
    "What's my workout today?",
    'I only have 20 minutes today',
    "I'm feeling low energy",
    'Can we modify today\'s workout?',
  ],
  
  postworkout: [
    'How was my workout?',
    'What should I eat for recovery?',
    "I'm really sore from yesterday",
    'Should I do cardio tomorrow?',
  ],
  
  nutrition: [
    "I'm hungry but low on calories",
    'High protein snack ideas?',
    "I'm eating out tonight, any tips?",
    'How are my macros looking?',
  ],
  
  struggling: [
    "I've been missing workouts",
    "I'm not seeing progress",
    'I keep overeating at night',
    'I need help staying motivated',
  ],
  
  planning: [
    'Plan my week ahead',
    'What should I focus on this week?',
    "I'm traveling next week",
    'Help me prep meals for the week',
  ],
};

/**
 * Morning prompt generator
 */
export const generateMorningPrompt = (userData) => {
  const { profile, yesterdayStats } = userData || {};
  
  const prompts = [
    `Good morning! Ready to crush another day? Let's make today count. 💪`,
    `Rise and shine! Your fitness journey continues today. What's on the agenda?`,
    `Hey there! New day, new opportunities. Let's keep that momentum going!`,
  ];
  
  let prompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  if (yesterdayStats?.workoutCompleted) {
    prompt += `\n\nGreat job on yesterday's workout! Your body will thank you.`;
  }
  
  if (yesterdayStats?.hitStepGoal) {
    prompt += `\n\nYou hit your step goal yesterday! Keep up that movement.`;
  }
  
  return prompt;
};

/**
 * Evening reflection prompt generator
 */
export const generateEveningPrompt = (userData) => {
  const { todayStats, profile } = userData || {};
  
  let prompt = `Time to reflect on today. `;
  
  if (todayStats?.workoutCompleted) {
    prompt += `You got your workout in - that's a win! `;
  } else if (todayStats?.stepGoal && todayStats?.steps >= todayStats.stepGoal) {
    prompt += `You hit your step goal! `;
  }
  
  prompt += `How are you feeling about your nutrition today?`;
  
  return prompt;
};

export default {
  COACH_SYSTEM_PROMPT,
  buildUserContext,
  SUGGESTED_PROMPTS,
  generateMorningPrompt,
  generateEveningPrompt,
};


