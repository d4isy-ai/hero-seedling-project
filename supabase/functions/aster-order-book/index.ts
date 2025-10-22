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
    const limit = url.searchParams.get('limit') || '10';

    if (!symbol) {
      return new Response(JSON.stringify({ 
        error: 'Symbol parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching order book for ${symbol} with limit ${limit}`);

    // Fetch order book from Aster API
    const depthUrl = `${ASTER_API_BASE}/fapi/v1/depth?symbol=${symbol}&limit=${limit}`;
    const response = await fetch(depthUrl);
    
    if (!response.ok) {
      console.error('Aster API error:', response.status, response.statusText);
      throw new Error(`Aster API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched order book data');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in aster-order-book function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to fetch order book data from Aster API'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
