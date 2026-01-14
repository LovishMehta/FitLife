// FatToFit AI Coach Edge Function
// Proxies requests to OpenAI and handles context building

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System prompt for the AI coach
const COACH_SYSTEM_PROMPT = `You are FitBuddy, an AI health and fitness coach for the FatToFit app. You are supportive, knowledgeable, motivating, and personable.

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
If asked about medical conditions, injuries requiring treatment, or symptoms that need professional evaluation, politely redirect to a healthcare professional.

Remember: You have access to the user's health data, workout history, meal logs, and goals. Reference this context to make your advice personalized and relevant.`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, history } = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build context string
    let contextString = ''
    if (context?.profile) {
      const p = context.profile
      contextString += `\n\n## Current User Context\n`
      contextString += `### User Profile\n`
      contextString += `- Name: ${p.full_name || 'User'}\n`
      contextString += `- Age: ${p.age || 'Not set'}\n`
      contextString += `- Gender: ${p.gender || 'Not set'}\n`
      contextString += `- Current Weight: ${p.current_weight_kg ? `${p.current_weight_kg} kg` : 'Not set'}\n`
      contextString += `- Goal Weight: ${p.goal_weight_kg ? `${p.goal_weight_kg} kg` : 'Not set'}\n`
      contextString += `- Fitness Level: ${p.fitness_experience || 'Not set'}\n`
      contextString += `- Primary Goal: ${p.primary_goal?.replace('_', ' ') || 'Not set'}\n`
      if (p.dietary_restrictions?.length) {
        contextString += `- Dietary Restrictions: ${p.dietary_restrictions.join(', ')}\n`
      }
      if (p.injuries_limitations) {
        contextString += `- Limitations: ${p.injuries_limitations}\n`
      }
    }

    if (context?.todayStats) {
      const s = context.todayStats
      contextString += `\n### Today's Progress\n`
      contextString += `- Steps: ${s.steps?.toLocaleString() || 0} / ${s.stepGoal?.toLocaleString() || 10000} goal\n`
      contextString += `- Calories Consumed: ${s.caloriesConsumed || 0} / ${s.calorieGoal || 'Not set'} goal\n`
      contextString += `- Calories Burned: ${s.caloriesBurned || 0}\n`
      contextString += `- Protein: ${s.protein || 0}g / ${s.proteinGoal || 'Not set'}g goal\n`
      contextString += `- Water: ${s.water || 0}ml / ${s.waterGoal || 2500}ml goal\n`
    }

    // Build messages array
    const messages = [
      { role: 'system', content: COACH_SYSTEM_PROMPT + contextString },
    ]

    // Add conversation history (last 10 messages)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10)
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.message || msg.content,
          })
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    const startTime = Date.now()

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({
        message: data.choices[0]?.message?.content,
        tokens_used: data.usage?.total_tokens || 0,
        model: data.model,
        response_time_ms: responseTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Coach chat error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})


