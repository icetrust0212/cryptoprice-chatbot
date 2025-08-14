// lib/tools/crypto.ts
import { z } from 'zod';
import { tool } from 'ai';

const BINANCE_BASES = [
  'https://api.binance.com',
  'https://api-gcp.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
  'https://api4.binance.com',
] as const;

// Common Binance quote assets (not exhaustive, good coverage for spot)
const QUOTES = [
  'USDT','USDC','FDUSD','TUSD','BUSD','USD','BTC','ETH','BNB','EUR','TRY','BRL'
];

function normalizeToPair(input: string) {
  const raw = input.trim().toUpperCase().replace(/\s+/g, '');
  if (!raw) throw new Error('Empty symbol.');
  // If user gives base only (e.g., BTC), default to USDT
  if (!QUOTES.some(q => raw.endsWith(q))) return `${raw}USDT`;
  return raw;
}

async function fetchWithFallback(path: string, init?: RequestInit) {
  let lastErr: unknown;
  for (const base of BINANCE_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...init,
        // avoid caching; keep it snappy
        cache: 'no-store',
      });
      if (!res.ok) {
        // try to parse Binance error JSON (e.g., code -1121 invalid symbol)
        let body: any = null;
        try { body = await res.json(); } catch {}
        const msg = body?.msg || res.statusText || 'Unknown error';
        throw new Error(`Binance error ${res.status}: ${msg}`);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      // try the next base
    }
  }
  throw lastErr ?? new Error('All Binance endpoints failed.');
}

export const getCryptoPrice = tool({
  description:
    'Get current spot price for a Binance trading pair. Input like "BTC" (defaults to USDT) or full pair like "BTCUSDT".',
  inputSchema: z.object({
    symbol: z.string().min(2).describe('Crypto symbol or pair, e.g. BTC or BTCUSDT'),
  }),
  // Return a tiny, typed payload the UI can render
  execute: async ({ symbol }, { abortSignal }) => {
    const pair = normalizeToPair(symbol);
    const data = await fetchWithFallback(`/api/v3/ticker/price?symbol=${pair}`, {
      signal: abortSignal,
      headers: { Accept: 'application/json' },
    });

    // Expected shape: { symbol: 'BTCUSDT', price: '60000.00' }
    const num = Number(data?.price);
    if (!data?.symbol || Number.isNaN(num)) {
      throw new Error(`Unexpected response for "${pair}". Try another pair.`);
    }

    // infer quote by suffix match
    const quote = QUOTES.find(q => data.symbol.endsWith(q)) ?? 'USDT';
    const base = data.symbol.slice(0, data.symbol.length - quote.length);

    return {
      symbol: data.symbol,
      base,
      quote,
      price: num,
      asOfISO: new Date().toISOString(),
      source: 'binance-spot',
    };
  },
});
