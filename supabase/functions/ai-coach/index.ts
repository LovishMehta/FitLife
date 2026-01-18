// FitLife Health Tracker - AI Coach Edge Function
// Per MVP doc: GPT-3.5 Turbo with 7 days context
//
// Deploy with: supabase functions deploy ai-coach

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  message: string;
  userId: string;
  context: {
    summary: string;
    facts: Record<string, unknown>;
    stepData: string;
    conversation: string;
    dailyGoal: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, userId, context } = (await req.json()) as RequestBody;

    // Get OpenAI API key from secrets
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt per MVP doc
    const systemPrompt = `You are Ria, a friendly AI health coach for FitLife app.

USER CONTEXT:
${context.summary ? `ABOUT THIS USER:\n${context.summary}\n` : ""}
${context.facts && Object.keys(context.facts).length > 0 ? `IMPORTANT FACTS:\n${JSON.stringify(context.facts, null, 2)}\n` : ""}
DAILY GOAL: ${context.dailyGoal.toLocaleString()} steps/day

${context.stepData}

GUIDELINES:
- Be encouraging, friendly, and supportive
- Reference the user's actual step data when relevant
- Keep responses under 150 words
- Use emojis sparingly but effectively
- If they're struggling, be empathetic not pushy
- For health concerns, recommend consulting healthcare professionals
- Focus on progress, not perfection`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history if available
    if (context.conversation) {
      const conversationLines = context.conversation.split("\n");
      for (const line of conversationLines) {
        if (line.startsWith("User: ")) {
          messages.push({ role: "user", content: line.replace("User: ", "") });
        } else if (line.startsWith("Ria: ")) {
          messages.push({ role: "assistant", content: line.replace("Ria: ", "") });
        }
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I'm having trouble thinking right now. Please try again!";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
