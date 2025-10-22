import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TRADING_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

export const AIAnalysisChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAnalysis = async (customPrompt?: string) => {
    const userMessage = customPrompt || `Provide a comprehensive market analysis for ${selectedSymbol.replace('USDT', '')} including current trends, key levels, and potential trading opportunities.`;
    
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    let assistantContent = '';

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-market-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          symbol: selectedSymbol,
        }),
      });

      if (response.status === 429) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please wait a moment.",
          variant: "destructive",
        });
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({
          title: "Credits Depleted",
          description: "AI credits have run out. Please add credits to continue.",
          variant: "destructive",
        });
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error('Failed to get analysis');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantContent;
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, will be completed in next chunk
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error getting analysis:', error);
      toast({
        title: "Error",
        description: "Failed to get AI analysis. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    getAnalysis(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Market Analysis</CardTitle>
        </div>
        <CardDescription>
          AI-powered insights and market intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex gap-2">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRADING_SYMBOLS.map(symbol => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol.replace('USDT', '')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => getAnalysis()} 
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            Get Analysis
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a token and click "Get Analysis"</p>
                <p className="text-sm mt-2">Or ask me anything about crypto markets</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about market trends, strategies, or analysis..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          AI-powered • Real-time market data
        </p>
      </CardContent>
    </Card>
  );
};
