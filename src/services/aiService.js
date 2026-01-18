import { supabase, isSupabaseConfigured, getSession } from './supabaseService';
import storageService from './storageService';
import chatService from './chatService';

/**
 * AI Service - Hybrid Implementation
 * 
 * Smart routing between:
 * 1. LOCAL responses - For factual data (steps, weekly report, goals)
 * 2. LLM responses - For conversational/motivational (when available)
 * 3. FALLBACK responses - Pre-written helpful responses
 * 
 * Benefits:
 * - Fast responses for data questions (no API call needed)
 * - Accurate data (reads directly from storage)
 * - Works offline for most queries
 * - Only uses LLM tokens for conversational parts
 */

// Intent categories
const INTENTS = {
  STEP_COUNT_TODAY: 'step_count_today',
  WEEKLY_REPORT: 'weekly_report',
  GOAL_PROGRESS: 'goal_progress',
  MOTIVATION: 'motivation',
  DIET_NUTRITION: 'diet_nutrition',
  EXERCISE_WORKOUT: 'exercise_workout',
  GREETING: 'greeting',
  HELP: 'help',
  GENERAL: 'general',
};

class AIService {
  constructor() {
    this.isConfigured = false;
  }

  /**
   * Detect user intent from message
   * Returns the most likely intent category
   */
  detectIntent(message) {
    const lower = message.toLowerCase().trim();
    
    // Step count today
    if (
      (lower.includes('step') && (lower.includes('today') || lower.includes('now') || lower.includes('current'))) ||
      lower.includes('how many step') ||
      lower.includes('my step') ||
      lower === 'steps' ||
      lower === 'step count'
    ) {
      return INTENTS.STEP_COUNT_TODAY;
    }
    
    // Weekly report / progress
    if (
      lower.includes('week') ||
      lower.includes('report') ||
      lower.includes('summary') ||
      lower.includes('how am i doing') ||
      lower.includes('my progress') ||
      lower.includes('last 7') ||
      lower.includes('past week')
    ) {
      return INTENTS.WEEKLY_REPORT;
    }
    
    // Goal progress
    if (
      (lower.includes('goal') && !lower.includes('set goal')) ||
      lower.includes('target') ||
      lower.includes('how close') ||
      lower.includes('reach my goal') ||
      lower.includes('% of') ||
      lower.includes('percent')
    ) {
      return INTENTS.GOAL_PROGRESS;
    }
    
    // Motivation
    if (
      lower.includes('motivat') ||
      lower.includes('tired') ||
      lower.includes('hard') ||
      lower.includes('difficult') ||
      lower.includes('lazy') ||
      lower.includes('don\'t feel like') ||
      lower.includes('cant be bothered') ||
      lower.includes('give up') ||
      lower.includes('encourage') ||
      lower.includes('inspire')
    ) {
      return INTENTS.MOTIVATION;
    }
    
    // Diet / Nutrition
    if (
      lower.includes('diet') ||
      lower.includes('food') ||
      lower.includes('eat') ||
      lower.includes('nutrition') ||
      lower.includes('calorie') ||
      lower.includes('meal') ||
      lower.includes('healthy eating')
    ) {
      return INTENTS.DIET_NUTRITION;
    }
    
    // Exercise / Workout
    if (
      lower.includes('workout') ||
      lower.includes('exercise') ||
      lower.includes('train') ||
      lower.includes('gym') ||
      lower.includes('cardio') ||
      lower.includes('strength') ||
      lower.includes('run') ||
      lower.includes('jog')
    ) {
      return INTENTS.EXERCISE_WORKOUT;
    }
    
    // Greeting
    if (
      lower === 'hi' ||
      lower === 'hello' ||
      lower === 'hey' ||
      lower.startsWith('hi ') ||
      lower.startsWith('hello ') ||
      lower.includes('good morning') ||
      lower.includes('good afternoon') ||
      lower.includes('good evening')
    ) {
      return INTENTS.GREETING;
    }
    
    // Help
    if (
      lower.includes('help') ||
      lower.includes('what can you do') ||
      lower.includes('how do i') ||
      lower === '?'
    ) {
      return INTENTS.HELP;
    }
    
    return INTENTS.GENERAL;
  }

  /**
   * Main response handler with smart routing
   */
  async getResponse(userMessage) {
    // Save user message first
    await chatService.saveMessage({
      message: userMessage,
      isUser: true,
    });

    // Detect intent
    const intent = this.detectIntent(userMessage);
    console.log(`🎯 Detected intent: ${intent}`);
    
    let response;
    
    // Route based on intent
    switch (intent) {
      case INTENTS.STEP_COUNT_TODAY:
        response = await this.getStepCountResponse();
        break;
        
      case INTENTS.WEEKLY_REPORT:
        response = await this.getWeeklyReportResponse();
        break;
        
      case INTENTS.GOAL_PROGRESS:
        response = await this.getGoalProgressResponse();
        break;
        
      case INTENTS.MOTIVATION:
        response = await this.getMotivationResponse();
        break;
        
      case INTENTS.DIET_NUTRITION:
        response = this.getDietResponse();
        break;
        
      case INTENTS.EXERCISE_WORKOUT:
        response = this.getExerciseResponse();
        break;
        
      case INTENTS.GREETING:
        response = await this.getGreetingResponse();
        break;
        
      case INTENTS.HELP:
        response = this.getHelpResponse();
        break;
        
      default:
        // Try LLM for general questions, fallback to helpful response
        response = await this.tryLLMOrFallback(userMessage);
    }
    
    // Save AI response
    await chatService.saveMessage({
      message: response,
      isUser: false,
    });
    
    return response;
  }

  /**
   * LOCAL: Get today's step count response
   */
  async getStepCountResponse() {
    const steps = await storageService.getTodaySteps();
    const goal = await storageService.getDailyGoal();
    const percent = Math.round((steps / goal) * 100);
    const remaining = Math.max(0, goal - steps);
    
    if (steps === 0) {
      return `📱 You haven't recorded any steps yet today!

Time to get moving! Even a short 10-minute walk can add 1,000+ steps.

Your goal: ${goal.toLocaleString()} steps
Let's start walking! 🚶`;
    }
    
    if (percent >= 100) {
      return `🎉 Amazing! You've walked ${steps.toLocaleString()} steps today!

That's ${percent}% of your ${goal.toLocaleString()} goal - you crushed it!

Keep up the fantastic work! Every step counts towards a healthier you. 💪`;
    }
    
    if (percent >= 75) {
      return `🔥 Great progress! You've walked ${steps.toLocaleString()} steps today!

That's ${percent}% of your ${goal.toLocaleString()} goal.
Only ${remaining.toLocaleString()} steps to go - you're almost there!

A quick 15-minute walk should do it! 🚶`;
    }
    
    if (percent >= 50) {
      return `👍 Solid effort! You've walked ${steps.toLocaleString()} steps today.

That's ${percent}% of your ${goal.toLocaleString()} goal.
${remaining.toLocaleString()} steps remaining.

You're halfway there - keep it up! Try taking a walking break. 🌟`;
    }
    
    return `📊 You've walked ${steps.toLocaleString()} steps today so far.

That's ${percent}% of your ${goal.toLocaleString()} goal.
${remaining.toLocaleString()} steps to go.

💡 Tip: Try taking short walks throughout the day - after meals or during breaks!`;
  }

  /**
   * LOCAL: Get weekly report response - Matches Progress screen style
   */
  async getWeeklyReportResponse() {
    const history = await storageService.getStepHistory();
    const goal = await storageService.getDailyGoal();
    const dates = storageService.getLastNDates(7);
    
    let total = 0;
    let daysWithData = 0;
    let streak = 0;
    let currentStreak = 0;
    let bestDay = { steps: 0, dayName: '' };
    let maxSteps = 0;
    
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dayData = [];
    
    // Collect data
    dates.forEach(dateKey => {
      const steps = history[dateKey] || 0;
      const date = new Date(dateKey);
      const dayLetter = dayLetters[date.getDay()];
      const isToday = dateKey === storageService.getTodayKey();
      
      dayData.push({ dayLetter, steps, isToday });
      
      total += steps;
      if (steps > 0) {
        daysWithData++;
        currentStreak++;
      } else {
        if (currentStreak > streak) streak = currentStreak;
        currentStreak = 0;
      }
      if (steps > maxSteps) maxSteps = steps;
      if (steps > bestDay.steps) {
        bestDay = { steps, dayName: dayLetter };
      }
    });
    if (currentStreak > streak) streak = currentStreak;
    
    const average = daysWithData > 0 ? Math.round(total / daysWithData) : 0;
    const calories = Math.round(total * 0.04);
    
    // Build the visual representation
    let response = `◀  **This Week**  ▶

`;
    
    // Large total number
    response += `        **${total.toLocaleString()}**
        AVG ${average} ↓

`;
    
    // Visual bar chart - horizontal style matching the app
    const barChars = ['░', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    
    // Step counts row
    let stepsLine = '';
    dayData.forEach(day => {
      const stepStr = day.steps.toString();
      stepsLine += stepStr.padStart(5, ' ') + '  ';
    });
    response += stepsLine.trim() + '\n';
    
    // Bar visualization row
    let barsLine = '';
    dayData.forEach(day => {
      const barHeight = maxSteps > 0 ? Math.floor((day.steps / maxSteps) * 8) : 0;
      const bar = day.steps > 0 ? barChars[Math.min(barHeight, 8)] : '·';
      barsLine += '  ' + bar + '    ';
    });
    response += barsLine.trim() + '\n';
    
    // Goal line (using dashes)
    response += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    
    // Day letters row
    let daysLine = '';
    dayData.forEach(day => {
      if (day.isToday) {
        daysLine += '  **' + day.dayLetter + '**  ';
      } else {
        daysLine += '   ' + day.dayLetter + '   ';
      }
    });
    response += daysLine.trim() + '\n\n';
    
    // Stats boxes
    response += `┌─────────────┬─────────────┐
│     🔥      │     ❤️      │
│     **${streak}**       │     **${calories}**     │
│  Day Streak │ kcal Burned │
└─────────────┴─────────────┘

`;
    
    // Weekly Summary section
    response += `**Weekly Summary**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total Steps: ${total.toLocaleString()}
📈 Daily Average: ${average.toLocaleString()}
🎯 Goal: ${goal.toLocaleString()} steps/day
${bestDay.steps > 0 ? `⭐ Best Day: ${bestDay.dayName} (${bestDay.steps.toLocaleString()})` : ''}`;
    
    return response;
  }

  /**
   * LOCAL: Get goal progress response
   */
  async getGoalProgressResponse() {
    const steps = await storageService.getTodaySteps();
    const goal = await storageService.getDailyGoal();
    const percent = Math.round((steps / goal) * 100);
    const remaining = Math.max(0, goal - steps);
    
    // Calculate time-based insight
    const now = new Date();
    const hour = now.getHours();
    const hoursLeft = 24 - hour;
    const stepsPerHour = remaining > 0 ? Math.round(remaining / hoursLeft) : 0;
    
    // Progress bar visualization
    const filled = Math.min(10, Math.round(percent / 10));
    const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    
    let message = `🎯 **Goal Progress**

[${progressBar}] ${percent}%

📍 Current: ${steps.toLocaleString()} steps
🏁 Goal: ${goal.toLocaleString()} steps
`;
    
    if (percent >= 100) {
      message += `\n🎉 **GOAL ACHIEVED!** You did it!

You've exceeded your daily goal. Amazing work! 
Keep moving to push even further, or take a well-deserved rest.`;
    } else {
      message += `⏳ Remaining: ${remaining.toLocaleString()} steps

`;
      if (hoursLeft > 0 && remaining > 0) {
        message += `💡 To reach your goal: ~${stepsPerHour} steps/hour for the next ${hoursLeft} hours.

`;
      }
      
      if (remaining <= 1000) {
        message += `You're SO close! A quick 10-minute walk will get you there! 🔥`;
      } else if (remaining <= 3000) {
        message += `A 20-30 minute walk should do it. You've got this! 💪`;
      } else if (remaining <= 5000) {
        message += `Try breaking it up - a few short walks throughout the day. 🚶`;
      } else {
        message += `Start with a 15-minute walk and build from there! 🌟`;
      }
    }
    
    return message;
  }

  /**
   * LOCAL: Get motivation response with data context
   */
  async getMotivationResponse() {
    const history = await storageService.getStepHistory();
    const goal = await storageService.getDailyGoal();
    const dates = storageService.getLastNDates(7);
    
    // Find best day in the week
    let bestDay = { date: '', steps: 0, dayName: '' };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dates.forEach(dateKey => {
      const steps = history[dateKey] || 0;
      if (steps > bestDay.steps) {
        const date = new Date(dateKey);
        bestDay = { date: dateKey, steps, dayName: dayNames[date.getDay()] };
      }
    });
    
    const motivationalQuotes = [
      "The only bad workout is the one that didn't happen.",
      "Small steps every day lead to big changes.",
      "You don't have to be perfect, you just have to keep moving.",
      "Every step is a step towards a healthier you.",
      "Progress, not perfection.",
    ];
    
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    let message = `💪 **You've Got This!**

I know some days are harder than others - and that's completely okay!

> "${randomQuote}"

`;
    
    if (bestDay.steps > 0) {
      message += `🌟 Remember ${bestDay.dayName}? You walked ${bestDay.steps.toLocaleString()} steps! You have that same energy in you today.

`;
    }
    
    message += `**Try these small wins:**
• Take a 5-minute walk right now
• Walk while on a phone call
• Park farther away
• Take the stairs once today

Every single step counts. Start small, build momentum. You're already doing better than staying still! 🚀`;
    
    return message;
  }

  /**
   * LOCAL: Get diet/nutrition response
   */
  getDietResponse() {
    return `🥗 **Nutrition Tips for Active Living**

Great that you're thinking about nutrition! Here's how to fuel your walking routine:

**Before Walking:**
• Light snack if hungry (banana, handful of nuts)
• Stay hydrated - drink water 30 min before

**After Walking:**
• Protein + carbs within 1 hour (yogurt, eggs, whole grains)
• Rehydrate with water or electrolytes

**Daily Habits:**
• 💧 8 glasses of water daily
• 🥬 Fill half your plate with vegetables
• 🍗 Include protein in every meal
• 🚫 Limit sugary drinks and processed foods

**Pro tip:** Walking after meals helps with digestion and blood sugar control!

For personalized nutrition advice, consider consulting a registered dietitian. 🩺`;
  }

  /**
   * LOCAL: Get exercise/workout response
   */
  getExerciseResponse() {
    return `🏃 **Level Up Your Walking!**

Walking is fantastic exercise. Here's how to make it even better:

**Beginner Tips:**
• Start with 10-15 minutes, build up gradually
• Walk at a pace where you can talk but not sing
• Comfortable shoes are essential

**Intermediate Challenges:**
• 🔥 Interval walking: Fast for 1 min, normal for 2 min
• 🏔️ Add hills or stairs for extra intensity
• 💪 Swing your arms to engage upper body
• ⏱️ Track your pace and try to improve

**Walking Variations:**
• Power walking - faster pace, arms pumping
• Nordic walking - with poles for full-body workout
• Rucking - walking with a weighted backpack

**Recovery:**
• Stretch after walks (calves, hamstrings, hips)
• Rest days are important too!
• Listen to your body

Consistency beats intensity - regular walks are better than occasional hard workouts! 🌟`;
  }

  /**
   * LOCAL: Get greeting response with context
   */
  async getGreetingResponse() {
    const steps = await storageService.getTodaySteps();
    const goal = await storageService.getDailyGoal();
    const percent = Math.round((steps / goal) * 100);
    
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = 'Hello';
    
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    let statusMessage = '';
    if (steps === 0) {
      statusMessage = "Ready to start moving today?";
    } else if (percent >= 100) {
      statusMessage = `Amazing - you've already hit your goal with ${steps.toLocaleString()} steps! 🎉`;
    } else if (percent >= 50) {
      statusMessage = `You're doing great - ${steps.toLocaleString()} steps so far (${percent}% of goal)!`;
    } else {
      statusMessage = `You've got ${steps.toLocaleString()} steps today. Let's keep moving!`;
    }
    
    return `${timeGreeting}! 👋 I'm Ria, your AI health coach.

${statusMessage}

How can I help you today? You can ask me about:
• Your step count or weekly progress
• Motivation and tips
• Exercise and nutrition advice

What's on your mind?`;
  }

  /**
   * LOCAL: Get help response
   */
  getHelpResponse() {
    return `🤖 **Hi! I'm Ria, your AI health coach.**

Here's what I can help you with:

**📊 Track Your Progress**
• "How many steps today?"
• "Show me my weekly report"
• "How close am I to my goal?"

**💪 Stay Motivated**
• "I need motivation"
• "Help me reach my goal"
• "I'm feeling tired"

**🥗 Health Tips**
• "Give me nutrition tips"
• "How can I exercise more?"
• "Walking tips"

**Just ask naturally!** I understand questions like:
• "How am I doing this week?"
• "What's my step count?"
• "I don't feel like walking today"

I'm here to help you build healthy habits, one step at a time! 🚶`;
  }

  /**
   * Try LLM for general questions, fallback to helpful response
   */
  async tryLLMOrFallback(userMessage) {
    // Check if we can use LLM
    if (!isSupabaseConfigured()) {
      return this.getFallbackResponse(userMessage);
    }
    
    let session = null;
    try {
      session = await getSession();
    } catch (err) {
      console.log('Session check error:', err);
    }
    
    if (!session?.user?.id) {
      return this.getFallbackResponse(userMessage);
    }
    
    // Try to call LLM
    try {
      const context = await this.buildContext();
      const stepDataPrompt = this.formatStepDataForPrompt(context.stepData, context.dailyGoal);
      
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: userMessage,
          userId: session.user.id,
          context: {
            summary: context.summary?.summary || '',
            facts: context.summary?.facts || {},
            stepData: stepDataPrompt,
            dailyGoal: context.dailyGoal,
          },
        },
      });
      
      if (error) {
        console.log('LLM unavailable, using fallback');
        return this.getFallbackResponse(userMessage);
      }
      
      return data?.response || this.getFallbackResponse(userMessage);
      
    } catch (error) {
      console.log('LLM error, using fallback:', error.message);
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Fallback response for general questions
   */
  getFallbackResponse(userMessage) {
    return `Thanks for your message! 😊

I'm best at helping you with:
• **Step tracking** - "How many steps today?"
• **Weekly progress** - "How am I doing this week?"
• **Motivation** - "I need encouragement"
• **Health tips** - "Give me exercise tips"

Try asking one of these, and I'll give you personalized insights based on your actual data!

What would you like to know?`;
  }

  /**
   * Build context for LLM requests
   */
  async buildContext() {
    const summary = await chatService.getUserSummary();
    const conversation = await chatService.getCurrentConversation();
    const stepData = await this.getLast7DaysSteps();
    const dailyGoal = await storageService.getDailyGoal();
    
    return { summary, conversation, stepData, dailyGoal };
  }

  /**
   * Get last 7 days of step data
   */
  async getLast7DaysSteps() {
    const history = await storageService.getStepHistory();
    const dates = storageService.getLastNDates(7);
    
    return dates.map(dateKey => ({
      date: dateKey,
      steps: history[dateKey] || 0,
    }));
  }

  /**
   * Format step data for LLM prompt
   */
  formatStepDataForPrompt(stepData, dailyGoal) {
    let prompt = `\nLAST 7 DAYS:\n`;
    let total = 0;
    let daysGoalAchieved = 0;
    
    stepData.forEach(day => {
      prompt += `- ${day.date}: ${day.steps.toLocaleString()} steps\n`;
      total += day.steps;
      if (day.steps >= dailyGoal) {
        daysGoalAchieved++;
      }
    });
    
    const avg = Math.round(total / stepData.length);
    
    prompt += `\nSUMMARY:\n`;
    prompt += `- Weekly total: ${total.toLocaleString()} steps\n`;
    prompt += `- Daily average: ${avg.toLocaleString()} steps\n`;
    prompt += `- Goal achieved: ${daysGoalAchieved}/7 days\n`;
    prompt += `- Daily goal: ${dailyGoal.toLocaleString()} steps\n`;
    
    return prompt;
  }

  /**
   * Get suggested actions for the chat
   */
  getSuggestedActions() {
    return [
      "What's my step count today?",
      "Show me my weekly report",
      "I need motivation",
    ];
  }
}

export default new AIService();
