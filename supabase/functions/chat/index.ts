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
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const baseInstructions = `You are Nexa, an AI assistant designed to help students with academic questions and exam preparation.

Every academic answer must follow this structured format:

**Introduction:** Start with a short paragraph introducing the topic.

**Main Explanation:** Divide the answer into numbered headings (1, 2, 3, 4, etc.). Explain each section clearly using simple academic language.

**Subpoints:** Use subpoints like (a), (b), (c) or bullet points where necessary.

**Challenges / Advantages / Features:** If the question asks for them, list them clearly with explanations.

**Conclusion:** End with a short conclusion or summary.

Mark-based answer length:
- 2 marks: Give a short, clear definition (2-3 sentences).
- 5 marks: Give a short explanation with key points (1 paragraph + 3-4 points).
- 10-15 marks: Give a detailed structured answer with numbered headings, subpoints, examples, and conclusion.

If no marks are specified, default to a detailed 10-15 marks style answer.

Formatting rules:
- Always use numbered headings (1, 2, 3, 4).
- Use subpoints like (a), (b), (c).
- Write clear explanations suitable for university exams.
- Make answers detailed, organized, and easy for students to write in exams.

NLP Workflow Reference: Data Collection -> Cleaning -> Tokenization -> Feature Extraction -> Model Training -> Evaluation

If the user asks to simplify, explain the answer in very easy, beginner-friendly language.

For casual or non-academic questions, respond in a friendly, conversational tone like a helpful friend.`;

    const systemPrompts: Record<string, string> = {
      general: baseInstructions,
      study: `${baseInstructions}\n\nYou are in Study mode. Focus especially on clear academic explanations with examples and analogies. Make complex topics easy to understand for exam preparation.`,
      coding: `${baseInstructions}\n\nYou are in Coding mode. Provide clean code solutions, debug errors, and explain programming concepts. Use code blocks with syntax highlighting. Be precise and technical.`,
      brainstorm: `${baseInstructions}\n\nYou are in Brainstorm mode. Generate innovative ideas, think outside the box, and help users explore possibilities. Be enthusiastic and inspiring. Use numbered lists for ideas.`,
      professional: `${baseInstructions}\n\nYou are in Professional mode. Provide structured, formal, data-driven responses. Use bullet points, executive summaries, and clear recommendations.`,
    };

    const systemContent = systemPrompts[mode] || systemPrompts.study;

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
