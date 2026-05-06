import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  // Detect SFW vs NSFW based on URL
  const url = new URL(request.url);
  const isNSFW = form.get("nsfw") === "true";

  // Build commission object exactly how the bot expects it
  const commission = {
    source: isNSFW ? "NSFW" : "SFW",
    name: form.get("name"),
    contactMethod: form.get("contact-method"),
    contactDetails: form.get("contact-details"),
    category: form.get("category"),
    type: form.get("type") || null,
    addons: {
      extraChars: form.get("addon-xtra-chars") === "on",
      extraCharCount: Number(form.get("xtra-char-count") || 0),
      background: form.get("addon-bg") === "on",
      sequential: form.get("addon-seq") === "on",
      sequentialCount: Number(form.get("seq-part-count") || 0),
      animation: form.get("addon-anim") === "on",
      commercial: form.get("addon-commercial") === "on",
      rush: form.get("addon-rush") === "on",
      rushDeadline: form.get("rush-deadline") || null
    },
    references: form.get("ref-links"),
    details: form.get("details"),
    paymentMethod: form.get("payment-method"),
    paymentEmail: form.get("payment-email"),
    subtotal: form.get("subtotal") || null
  };

  // Send to Render bot
  const response = await fetch(env.BOT_ENDPOINT + "/commission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commission)
  });

  // If the bot errors, surface it
  if (!response.ok) {
    return new Response("Bot error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
};
