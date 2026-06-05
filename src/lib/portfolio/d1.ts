import { env as cfEnv } from "cloudflare:workers";

type D1Result<T> = {
  results?: T[];
};

type D1PreparedStatement = {
  bind: (...params: unknown[]) => D1PreparedStatement;
  all: <T = unknown>() => Promise<D1Result<T>>;
  first: <T = unknown>() => Promise<T | null>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatement;
};

export function getPortfolioDB(_locals?: unknown): D1DatabaseLike | null {
  // Astro/Cloudflare runtime bindings during local dev + worker execution.
  try {
    const locals = (_locals ?? {}) as {
      runtime?: { env?: Record<string, unknown> };
    };
    const binding = locals.runtime?.env?.PORTFOLIO_DB;
    if (
      binding &&
      typeof binding === "object" &&
      "prepare" in binding &&
      typeof (binding as D1DatabaseLike).prepare === "function"
    ) {
      return binding as D1DatabaseLike;
    }
  } catch {
    // Ignore and continue to cloudflare:workers fallback
  }

  // Astro v6 + @astrojs/cloudflare v13: bindings via cloudflare:workers
  try {
    const binding = (cfEnv as Record<string, unknown>).PORTFOLIO_DB;
    if (
      binding &&
      typeof binding === "object" &&
      "prepare" in binding &&
      typeof (binding as D1DatabaseLike).prepare === "function"
    ) {
      return binding as D1DatabaseLike;
    }
  } catch {
    // Not running in Cloudflare Workers runtime — fall through
  }

  return null;
}
