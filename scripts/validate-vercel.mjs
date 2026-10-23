import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import checkoutFunction from "../api/create-checkout-session.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, clientScript, configText] = await Promise.all([
  readFile(resolve(projectRoot, "public/index.html"), "utf8"),
  readFile(resolve(projectRoot, "public/script.js"), "utf8"),
  readFile(resolve(projectRoot, "vercel.json"), "utf8"),
  access(resolve(projectRoot, "public/styles.css")),
]);
const config = JSON.parse(configText);
assert.equal(config.outputDirectory, "public");
assert.match(html, /script\.js/);
assert.match(clientScript, /api\/create-checkout-session/);

const previousSecret = process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_SECRET_KEY;
const missingKey = await checkoutFunction.fetch(
  new Request("https://example.vercel.app/api/create-checkout-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount: 25 }),
  }),
);
assert.equal(missingKey.status, 503);

let stripeRequest;
const originalFetch = globalThis.fetch;
process.env.STRIPE_SECRET_KEY = "test_secret";
globalThis.fetch = async (url, init) => {
  stripeRequest = { url, init };
  return new Response(JSON.stringify({ url: "https://checkout.stripe.com/test-session" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

try {
  const checkout = await checkoutFunction.fetch(
    new Request("https://example.vercel.app/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 25 }),
    }),
  );
  assert.equal(checkout.status, 200);
  assert.equal((await checkout.json()).url, "https://checkout.stripe.com/test-session");
  assert.equal(stripeRequest.url, "https://api.stripe.com/v1/checkout/sessions");
  assert.equal(stripeRequest.init.headers.authorization, "Bearer test_secret");
  const stripeBody = new URLSearchParams(stripeRequest.init.body);
  assert.equal(stripeBody.has("payment_method_types[0]"), false);
  assert.equal(stripeBody.get("line_items[0][price_data][unit_amount]"), "2500");
} finally {
  globalThis.fetch = originalFetch;
  if (previousSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = previousSecret;
}

console.log("Vercel build and Stripe function are valid");
