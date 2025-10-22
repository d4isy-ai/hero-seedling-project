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
    console.log('Fetching exchange information from Aster API');

    // Fetch exchange info from Aster API
    const response = await fetch(`${ASTER_API_BASE}/fapi/v1/exchangeInfo`);
    
    if (!response.ok) {
      console.error('Aster API error:', response.status, response.statusText);
      throw new Error(`Aster API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched exchange info');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in aster-exchange-info function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to fetch exchange info from Aster API'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
