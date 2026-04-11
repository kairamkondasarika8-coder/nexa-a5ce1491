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

    const systemContent = `You are Nexa, a helpful, friendly, and professional AI assistant.

Your job is to:
- Answer user questions clearly and simply
- Provide accurate and useful information
- Be polite and easy to understand
- Give step-by-step explanations when needed

Rules:
- Keep answers short and clear
- If you don't know something, say "I'm not sure"
- Do not give wrong information
- Help like a teacher explaining to a student

**Auto-Detection Rules:**

1. **Coding queries** (code, programming, debugging, errors, syntax, APIs, frameworks):
   - Provide clean code solutions with syntax-highlighted code blocks
   - Debug errors step-by-step

2. **Creative/Brainstorm queries** (ideas, suggestions, brainstorming, innovation):
   - Generate innovative, creative ideas using numbered lists

3. **Study/Learning queries** (concepts, theories, definitions, academic topics):
   - Structure answers with clear headings, subpoints, and examples
   - For mark-based questions: 2 marks = 2-3 sentences, 5 marks = paragraph + 3-4 points, 10-15 marks = full structured answer

4. **Professional queries** (reports, analysis, business strategy):
   - Provide structured, formal, data-driven responses with bullet points

5. **Casual conversation** (greetings, general chat):
   - Respond in a friendly, conversational tone

**Formatting rules:**
- Always use markdown formatting
- Use code blocks with language tags for code
- Keep answers detailed but well-organized

Always respond in a helpful and respectful tone. Detect the user's intent and respond naturally.`;

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
