import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol = 'BTC', endpoint } = await req.json();
    
    const COINGLASS_API_KEY = Deno.env.get('COINGLASS_API_KEY');
    if (!COINGLASS_API_KEY) {
      throw new Error('COINGLASS_API_KEY is not configured');
    }

    const baseUrl = 'https://open-api.coinglass.com/public/v2';
    
    // Map endpoints to CoinGlass API paths
    const endpointMap: { [key: string]: string } = {
      'openInterest': `/indicator/open-interest?symbol=${symbol}`,
      'fundingRate': `/indicator/funding-rate?symbol=${symbol}`,
      'longShortRatio': `/indicator/long-short-ratio?symbol=${symbol}`,
      'liquidation': `/indicator/liquidation?symbol=${symbol}&time_type=h24`,
      'fearGreed': `/indicator/fear-greed`,
      'rsi': `/indicator/rsi?symbol=${symbol}&interval=24h`,
      'activeBuy': `/indicator/active-buy-sell-ratio?symbol=${symbol}`,
      'optionsOI': `/indicator/options-open-interest?symbol=${symbol}`,
    };

    const apiPath = endpointMap[endpoint];
    if (!apiPath) {
      throw new Error(`Invalid endpoint: ${endpoint}`);
    }

    console.log(`Fetching CoinGlass data: ${baseUrl}${apiPath}`);

    const response = await fetch(`${baseUrl}${apiPath}`, {
      headers: {
        'CG-API-KEY': COINGLASS_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinGlass API error:', response.status, errorText);
      throw new Error(`CoinGlass API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('CoinGlass data received:', JSON.stringify(data, null, 2));

    // Check if the response has a success indicator
    if (data.success === false || data.code !== 0) {
      console.error('CoinGlass API returned error:', data);
      throw new Error(data.msg || 'CoinGlass API returned an error');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in coinglass-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
