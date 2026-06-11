import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { amount_cents, idempotency_key } = await req.json();

    if (!amount_cents || amount_cents < 100) {
      return new Response(JSON.stringify({ error: "Valor mínimo: R$ 1,00" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const PIX_TOKEN = Deno.env.get("PIX_DIRECT_TOKEN");
    if (!PIX_TOKEN) {
      return new Response(JSON.stringify({ error: "Token não configurado" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${PIX_TOKEN}`,
      "Content-Type": "application/json",
    };
    if (idempotency_key) headers["Idempotency-Key"] = idempotency_key;

    const resp = await fetch("https://pix.direct/v1/deposits", {
      method: "POST",
      headers,
      body: JSON.stringify({ amount_cents }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data.error || "Erro ao gerar Pix" }), {
        status: resp.status, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Erro interno: " + e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
});
