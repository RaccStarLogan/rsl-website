import type { APIRoute } from "astro";
import { listCommissionPricing } from "../../../lib/portfolio/repository";

export const GET: APIRoute = async ({ locals }) => {
  // Pricing is always served from the same repository layer as portfolio items.
  const pricing = await listCommissionPricing(locals);

  return new Response(JSON.stringify({ pricing }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
