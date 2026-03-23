import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemContent = `You are Nexa, an intelligent AI assistant. You automatically detect what the user needs and adapt your response style accordingly.

**Auto-Detection Rules:**

1. **Coding queries** (user mentions code, programming, debugging, errors, syntax, APIs, frameworks):
   - Provide clean code solutions with syntax-highlighted code blocks
   - Debug errors step-by-step
   - Explain programming concepts precisely and technically

2. **Creative/Brainstorm queries** (user asks for ideas, suggestions, brainstorming, innovation, names, plans):
   - Generate innovative, creative ideas
   - Use numbered lists for multiple suggestions
   - Be enthusiastic, inspiring, and think outside the box

3. **Study/Learning queries** (user asks to explain concepts, theories, definitions, academic topics, exam prep):
   - Structure answers with Introduction, Main Explanation (numbered headings), Subpoints, and Conclusion
   - Use simple academic language with examples and analogies
   - For mark-based questions: 2 marks = 2-3 sentences, 5 marks = paragraph + 3-4 points, 10-15 marks = full structured answer

4. **Professional/Advanced queries** (user needs reports, analysis, data-driven answers, business strategy):
   - Provide structured, formal, data-driven responses
   - Use bullet points, executive summaries, and clear recommendations

5. **Casual conversation** (greetings, general chat, opinions, fun questions):
   - Respond in a friendly, conversational tone like a helpful friend
   - Be warm and engaging

**Formatting rules:**
- Always use markdown formatting
- Use numbered headings (1, 2, 3) for structured answers
- Use subpoints like (a), (b), (c) where helpful
- Use code blocks with language tags for code
- Keep answers detailed but well-organized

Detect the user's intent from their message and respond in the most appropriate style. Do NOT mention which "mode" you are using — just respond naturally.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
