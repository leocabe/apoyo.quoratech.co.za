const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return json({ error: "O pagamento ainda não foi configurado na Vercel." }, 503);
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
        authorization: `Bearer ${stripeSecretKey}`,
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
  },
};
