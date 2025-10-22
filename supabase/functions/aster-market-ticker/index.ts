import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASTER_API_BASE = 'https://fapi.asterdex.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');

    console.log('Fetching 24hr ticker data', symbol ? `for ${symbol}` : 'for all symbols');

    // Fetch 24hr ticker from Aster API
    const tickerUrl = symbol 
      ? `${ASTER_API_BASE}/fapi/v1/ticker/24hr?symbol=${symbol}`
      : `${ASTER_API_BASE}/fapi/v1/ticker/24hr`;

    const response = await fetch(tickerUrl);
    
    if (!response.ok) {
      console.error('Aster API error:', response.status, response.statusText);
      throw new Error(`Aster API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched ticker data');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in aster-market-ticker function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to fetch market ticker data from Aster API'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
