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

// Input validation and normalization
function normalizeToPair(input: string) {
  if (!input || typeof input !== 'string') {
    throw new Error('Symbol must be a non-empty string');
  }

  const raw = input.trim().toUpperCase().replace(/\s+/g, '');
  
  if (!raw) {
    throw new Error('Empty symbol provided');
  }

  // Validate symbol length and characters
  if (raw.length < 2) {
    throw new Error('Symbol must be at least 2 characters long');
  }

  if (!/^[A-Z0-9]+$/.test(raw)) {
    throw new Error('Symbol can only contain letters and numbers');
  }

  // Common base assets that should default to USDT
  const commonBaseAssets = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX', 'UNI', 'ATOM'];
  
  // If it's a common base asset, add USDT
  if (commonBaseAssets.includes(raw)) {
    return `${raw}USDT`;
  }
  
  // If it doesn't end with a quote asset, add USDT
  if (!QUOTES.some(q => raw.endsWith(q))) {
    return `${raw}USDT`;
  }
  
  return raw;
}

// Enhanced fetch with timeout and retry logic
async function fetchWithFallback(path: string, init?: RequestInit) {
  let lastErr: unknown;
  const timeout = 10000; // 10 second timeout per request

  for (const base of BINANCE_BASES) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(`${base}${path}`, {
        ...init,
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          ...init?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Parse Binance error response
        let body: any = null;
        try { 
          body = await res.json(); 
        } catch {} 
        
        const msg = body?.msg || res.statusText || 'Unknown error';
        
        // Handle specific Binance error codes
        if (body?.code === -1121) {
          throw new Error(`Invalid symbol: "${path.split('=')[1]}" is not a valid trading pair`);
        }
        if (body?.code === -1001) {
          throw new Error('Binance API is temporarily unavailable - please try again');
        }
        if (res.status === 429) {
          throw new Error('Rate limit exceeded - please wait a moment and try again');
        }
        if (res.status >= 500) {
          throw new Error('Binance server error - please try again');
        }
        
        throw new Error(`Binance API error (${res.status}): ${msg}`);
      }

      const data = await res.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Binance API');
      }

      return data;
    } catch (e) {
      lastErr = e;
      console.error(`Failed to fetch from ${base}:`, e);
      
      // If it's a timeout or network error, try next endpoint
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          console.log(`Timeout for ${base}, trying next endpoint...`);
        } else if (e.message.includes('fetch')) {
          console.log(`Network error for ${base}, trying next endpoint...`);
        }
      }
    }
  }

  // All endpoints failed
  if (lastErr instanceof Error) {
    throw new Error(`Unable to fetch price data: ${lastErr.message}`);
  }
  throw new Error('All Binance endpoints failed - please try again later');
}

export const getCryptoPrice = tool({
  description:
    'Get current spot price for a Binance trading pair. Input like "BTC" (defaults to USDT) or full pair like "BTCUSDT".',
  inputSchema: z.object({
    symbol: z.string().min(2).max(20).describe('Crypto symbol or pair, e.g. BTC or BTCUSDT'),
  }),
  execute: async ({ symbol }, { abortSignal }) => {
    try {
      // Validate and normalize input
      const pair = normalizeToPair(symbol);
      
      console.log(`Input: "${symbol}" -> Normalized: "${pair}"`);

      // Fetch price data with retry logic
      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          const data = await fetchWithFallback(`/api/v3/ticker/price?symbol=${pair}`, {
            signal: abortSignal,
          });

          // Validate response data
          if (!data?.symbol || !data?.price) {
            throw new Error(`Invalid response format for "${pair}"`);
          }

          const num = Number(data.price);
          if (Number.isNaN(num) || num <= 0) {
            throw new Error(`Invalid price value for "${pair}": ${data.price}`);
          }

          // Extract base and quote from symbol
          const quote = QUOTES.find(q => data.symbol.endsWith(q)) ?? 'USDT';
          const base = data.symbol.slice(0, data.symbol.length - quote.length);

          if (!base) {
            throw new Error(`Could not parse base symbol from "${data.symbol}"`);
          }

          console.log(`Successfully fetched price for ${pair}: $${num}`);

          return {
            symbol: data.symbol,
            base,
            quote,
            price: num,
            asOfISO: new Date().toISOString(),
            source: 'binance-spot',
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          retries--;
          
          console.error(`Attempt ${4-retries}/3 failed for ${pair}:`, lastError.message);
          
          if (retries > 0) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, (4-retries) * 500));
          }
        }
      }

      // All retries failed
      throw new Error(`Failed to fetch price for "${pair}" after 3 attempts: ${lastError?.message}`);
    } catch (error) {
      console.error(`Error in getCryptoPrice for symbol "${symbol}":`, error);
      
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred while fetching the price');
    }
  },
});
