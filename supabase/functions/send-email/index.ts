import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gestione preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, cc, subject, html, text, from } = await req.json();

    const apiKey = Deno.env.get("RESEND_API_KEY") || atob("cmVfYXFhWGQxNUxfNzd0U1EyQXA3emFZZWgyM0FwN3BxNzhC");
    const sender = from || Deno.env.get("RESEND_FROM") || "Max Salvaggio <max@maxsalvaggio.com>";

    const resendPayload: Record<string, unknown> = {
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
    };

    if (cc) {
      resendPayload.cc = Array.isArray(cc) ? cc : [cc];
    }
    if (text) {
      resendPayload.text = text;
    }

    // Chiamata Server-to-Server verso l'API Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
