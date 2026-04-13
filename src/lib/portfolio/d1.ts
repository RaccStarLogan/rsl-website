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
