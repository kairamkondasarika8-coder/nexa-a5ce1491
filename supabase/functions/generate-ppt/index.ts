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
    const { topic, slideCount = 5, style = "professional" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a presentation expert. Generate exactly ${slideCount} slides for a ${style} presentation about the given topic.

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "slides": [
    {
      "title": "slide title",
      "content": ["bullet point 1", "bullet point 2", "bullet point 3"],
      "type": "title"
    }
  ]
}

Rules:
- First slide must have type "title" with an engaging title and 2-3 subtitle points
- Last slide must have type "summary" with key takeaways
- All other slides have type "content" with 3-5 bullet points each
- Make content detailed, informative, and ${style} in tone
- Total slides must be exactly ${slideCount}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a presentation about: ${topic}` },
        ],
        stream: false,
      }),
    });

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

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ppt error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Failed to generate presentation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
