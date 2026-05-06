import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {

  console.log("HANDLER START");

  const form = await request.formData();

  console.log("FORM PARSED");

  // Build commission object exactly how the bot expects it
  const commission = {
    source: form.get("nsfw") === "true" ? "NSFW" : "SFW",
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

  console.log("COMMISSION BUILT");
  console.log("SENDING TO BOT");

  // Send to Render bot
  const response = await fetch(env.BOT_ENDPOINT + "/commission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commission)
  });

  // If the bot errors, surface it
  if (!response.ok) {
    return new Response(JSON.stringify({ error: true }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  console.log("BOT RESPONSE:", response.status);

  console.log("BUILDING PARAMS");

  const params = new URLSearchParams({
    name: String(commission.name),
    contactMethod: String(commission.contactMethod),
    contactDetails: String(commission.contactDetails),
    category: String(commission.category),
    type: String(commission.type ?? ""),
    extraChars: String(commission.addons.extraChars),
    extraCharCount: String(commission.addons.extraCharCount),
    background: String(commission.addons.background),
    sequential: String(commission.addons.sequential),
    sequentialCount: String(commission.addons.sequentialCount),
    animation: String(commission.addons.animation),
    commercial: String(commission.addons.commercial),
    rush: String(commission.addons.rush),
    rushDeadline: String(commission.addons.rushDeadline),
    details: String(commission.details),
    references: String(commission.references),
    paymentMethod: String(commission.paymentMethod),
    paymentEmail: String(commission.paymentEmail),
    subtotal: String(commission.subtotal ?? "")
  });

  console.log("READY TO REDIRECT");

  const isNSFW = commission.source === "NSFW";

  const basePath = isNSFW
    ? "/nsfw/commissions/submitted"
    : "/commissions/submitted";

  try {
    console.log("REDIRECT URL:", `${basePath}?${params.toString()}`);
    return Response.redirect(`${basePath}?${params.toString()}`, 303);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return new Response(JSON.stringify({ error: true, message: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }


};
