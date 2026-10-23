const page = "__INDEX_HTML__";
const styles = "__STYLES_CSS__";
const clientScript = "__CLIENT_JS__";

const securityHeaders = {
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
};

function response(body, init = {}) {
  const headers = new Headers(init.headers || {});
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  return new Response(body, { ...init, headers });
}

function json(data, status = 200) {
  return response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function createCheckoutSession(request, env) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "O pagamento ainda não foi configurado. Adicione STRIPE_SECRET_KEY nas variáveis do Site." }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Pedido inválido." }, 400);
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount < 1 || amount > 5000 || Math.round(amount * 100) !== amount * 100) {
    return json({ error: "Escolha um valor entre US$ 1 e US$ 5.000." }, 400);
  }

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("submit_type", "donate");
  params.set("success_url", `${origin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/?donation=cancelled`);
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][product_data][name]", "Donación para la operación de Jhoel");
  params.set("line_items[0][price_data][product_data][description]", "Aporte solidario para la operación, exámenes y recuperación de Jhoel");
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[campaign]", "jhoel");

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const stripePayload = await stripeResponse.json().catch(() => null);
  if (!stripeResponse.ok || !stripePayload?.url) {
    const message = stripePayload?.error?.message || "Não foi possível iniciar o Checkout do Stripe.";
    return json({ error: message }, 502);
  }

  return json({ url: stripePayload.url });
}

export default {
  async fetch(request, env, ctx) {
    void ctx;
    const url = new URL(request.url);

    if (url.pathname === "/api/create-checkout-session") {
      if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);
      return createCheckoutSession(request, env);
    }

    if ((url.pathname === "/" || url.pathname === "/index.html") && request.method === "GET") {
      return response(page, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }
    if (url.pathname === "/styles.css" && request.method === "GET") {
      return response(styles, { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=3600" } });
    }
    if (url.pathname === "/script.js" && request.method === "GET") {
      return response(clientScript, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=3600" } });
    }
    if (url.pathname === "/health") return json({ ok: true });

    return response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
