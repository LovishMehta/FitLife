/**
 * Mock AI Service - Simulates AI Coach responses
 */
class MockAIService {
  constructor() {
    this.responses = {
      default: [
        "Based on your activity today, I can help you with personalized health tracking, nutrition guidance, workouts, water intake, sleep, steps, glucose levels while managing your health journey. Just ask anything related to your health! 😊",
        "I'm here to help you achieve your fitness goals! What would you like to know?",
        "Great job on your steps today! Keep up the momentum! 💪",
      ],
      diet: [
        "Here are some healthy meal suggestions based on your activity level:\n\n• Breakfast: Oatmeal with fruits and nuts\n• Lunch: Grilled chicken salad with quinoa\n• Dinner: Baked salmon with vegetables\n\nRemember to stay hydrated!",
        "For better nutrition, try to include:\n• 5 servings of fruits/vegetables daily\n• Lean proteins\n• Whole grains\n• Limit processed foods",
      ],
      recipes: [
        "Here are some healthy recipes perfect for you:\n\n🥗 Green Smoothie Bowl\n• Spinach, banana, mango\n• Greek yogurt\n• Chia seeds\n\n🍗 Grilled Chicken Wrap\n• Whole wheat tortilla\n• Grilled chicken\n• Fresh vegetables\n• Hummus",
        "Try this nutritious meal:\n\n🥑 Avocado Toast\n• Whole grain bread\n• Mashed avocado\n• Poached egg\n• Cherry tomatoes\n• Salt and pepper",
      ],
      progress: [
        "Your progress looks great! You've been consistent with your steps. Here's what I noticed:\n\n✅ Average daily steps: 8,500\n✅ Weekly goal completion: 85%\n✅ Streak: 5 days\n\nKeep it up!",
        "You're making excellent progress! Your activity level has increased by 15% this week compared to last week.",
      ],
      workout: [
        "Based on your current activity, here are some workout suggestions:\n\n🏃 Cardio: 30 min brisk walk\n💪 Strength: Bodyweight exercises\n🧘 Flexibility: 10 min stretching\n\nStart with what feels comfortable!",
        "For today, try this workout:\n\n1. Warm-up: 5 min walk\n2. Main: 20 min interval training\n3. Cool-down: 5 min stretching\n\nRemember to listen to your body!",
      ],
    };
  }

  /**
   * Get AI response based on user message
   * @param {string} message - User's message
   * @returns {Promise<string>} AI response
   */
  async getResponse(message) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('meal')) {
      return this.getRandomResponse('diet');
    }
    if (lowerMessage.includes('recipe') || lowerMessage.includes('cook') || lowerMessage.includes('meal plan')) {
      return this.getRandomResponse('recipes');
    }
    if (lowerMessage.includes('progress') || lowerMessage.includes('goal') || lowerMessage.includes('track')) {
      return this.getRandomResponse('progress');
    }
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('train')) {
      return this.getRandomResponse('workout');
    }
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('help')) {
      return this.getRandomResponse('default');
    }

    return this.getRandomResponse('default');
  }

  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getSuggestedActions() {
    return [
      "Improve my diet or routine",
      "Healthy recipes for me",
      "Track progress or set goals",
    ];
  }
}

export default new MockAIService();



