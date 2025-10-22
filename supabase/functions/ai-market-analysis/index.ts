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
    const { messages, symbol } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch current market data for the symbol
    let marketContext = '';
    if (symbol) {
      try {
        const marketResponse = await fetch(`https://fapi.asterdex.com/fapi/v1/ticker/24hr?symbol=${symbol}`);
        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          marketContext = `\n\nCurrent Market Data for ${symbol}:
- Last Price: $${parseFloat(marketData.lastPrice).toLocaleString()}
- 24h Change: ${marketData.priceChangePercent}%
- 24h High: $${parseFloat(marketData.highPrice).toLocaleString()}
- 24h Low: $${parseFloat(marketData.lowPrice).toLocaleString()}
- 24h Volume: ${parseFloat(marketData.volume).toLocaleString()} ${symbol.replace('USDT', '')}
- Quote Volume: $${parseFloat(marketData.quoteVolume).toLocaleString()}`;
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    }

    const systemPrompt = `You are Daisy AI, an expert cryptocurrency market analyst and trading advisor. You provide clear, actionable insights about crypto markets with a focus on BTC, ETH, SOL, BNB, and other major cryptocurrencies.

Your analysis should:
- Be data-driven and based on real market information provided
- Include both technical and fundamental perspectives
- Explain trends and patterns clearly
- Provide risk assessments
- Suggest potential trading strategies (for educational purposes)
- Be concise but comprehensive
- Use bullet points for clarity when appropriate

Always remind users that crypto trading involves significant risk and they should do their own research.${marketContext}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in ai-market-analysis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
