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

    const baseUrl = 'https://open-api-v4.coinglass.com/api';
    
    // Use the coins-markets endpoint which has all the data we need
    const apiPath = '/futures/coins-markets';

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
    if (data.code !== "0") {
      console.error('CoinGlass API returned error:', data);
      throw new Error(data.msg || 'CoinGlass API returned an error');
    }

    // Find the specific coin data
    const coinData = data.data?.find((coin: any) => coin.symbol === symbol);
    
    if (!coinData) {
      return new Response(JSON.stringify({ 
        code: "0",
        msg: "success",
        data: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transform the data based on the endpoint requested
    let responseData;
    switch(endpoint) {
      case 'openInterest':
        responseData = {
          code: "0",
          msg: "success",
          data: {
            usdVolume: coinData.open_interest_usd || 0,
            changePercent: coinData.open_interest_change_percent_24h || 0
          }
        };
        break;
      case 'fundingRate':
        responseData = {
          code: "0",
          msg: "success",
          data: {
            weightedFundingRate: (coinData.avg_funding_rate_by_oi || 0) * 100
          }
        };
        break;
      case 'longShortRatio':
        responseData = {
          code: "0",
          msg: "success",
          data: {
            ratio: coinData.long_short_ratio_24h || 0,
            longPercent: ((coinData.long_short_ratio_24h || 0) / ((coinData.long_short_ratio_24h || 0) + 1)) * 100
          }
        };
        break;
      case 'liquidation':
        responseData = {
          code: "0",
          msg: "success",
          data: {
            totalLiquidation: coinData.liquidation_usd_24h || 0
          }
        };
        break;
      case 'fearGreed':
        // Fear & Greed not in this endpoint, return placeholder
        responseData = {
          code: "0",
          msg: "success",
          data: {
            value: 50,
            valueClassification: 'Neutral'
          }
        };
        break;
      case 'rsi':
        // RSI not in this endpoint, return placeholder
        responseData = {
          code: "0",
          msg: "success",
          data: {
            rsi: 50
          }
        };
        break;
      case 'activeBuy':
        // Use volume change as proxy for buy pressure
        responseData = {
          code: "0",
          msg: "success",
          data: {
            buyRatio: 50
          }
        };
        break;
      case 'optionsOI':
        // Options OI not in this endpoint, return placeholder
        responseData = {
          code: "0",
          msg: "success",
          data: {
            totalOpenInterest: 0
          }
        };
        break;
      default:
        responseData = data;
    }

    return new Response(JSON.stringify(responseData), {
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
