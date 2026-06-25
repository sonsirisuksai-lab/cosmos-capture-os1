import { useState, useRef, useEffect } from "react";
import { 
  useOrchestrate, 
  useGetOrchestrateHistory, getGetOrchestrateHistoryQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, TerminalSquare, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PromptTerminal() {
  const [prompt, setPrompt] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: history, isLoading: historyLoading } = useGetOrchestrateHistory(
    { limit: 50 },
    { query: { queryKey: getGetOrchestrateHistoryQueryKey({ limit: 50 }) } }
  );

  const orchestrate = useOrchestrate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrchestrateHistoryQueryKey() });
        setPrompt("");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Transmission Failed" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || orchestrate.isPending) return;
    orchestrate.mutate({ data: { prompt } });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [history, orchestrate.isPending]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6 flex items-center gap-3">
        <TerminalSquare className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">Maka Terminal</h1>
          <p className="text-muted-foreground font-mono text-xs">AI Crew Orchestrator Interface</p>
        </div>
      </header>

      <Card className="flex-1 flex flex-col glass-panel overflow-hidden border-primary/20">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {historyLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : history?.length ? (
              history.slice().reverse().map((entry) => (
                <div key={entry.id} className="space-y-4">
                  {/* User Prompt */}
                  <div className="flex justify-end">
                    <div className="bg-primary/20 text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] border border-primary/30 cosmic-glow shadow-sm text-sm">
                      {entry.prompt}
                    </div>
                  </div>
                  
                  {/* Agent Response */}
                  <div className="flex justify-start items-start gap-3 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-xl shrink-0 mt-1 shadow-md">
                      {entry.agentEmoji}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-accent">{entry.agentName}</span>
                        {entry.domain && (
                          <Badge variant="outline" className="text-[10px] uppercase bg-black/40 border-white/5 py-0">
                            {entry.domain}
                          </Badge>
                        )}
                      </div>
                      <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {entry.response}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <TerminalSquare className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="font-mono text-sm">Terminal online. Awaiting first transmission.</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                  Try asking for strategic advice, health tips, coding help, or emotional context.
                </p>
              </div>
            )}
            
            {orchestrate.isPending && (
              <div className="flex justify-start items-start gap-3 max-w-[85%] animate-pulse">
                <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-xl shrink-0 mt-1">
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                </div>
                <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Routing signal...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/50 border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Transmit prompt to crew..."
              className="pr-12 bg-black/50 border-primary/30 focus-visible:ring-primary h-12 text-base rounded-xl font-mono shadow-inner"
              disabled={orchestrate.isPending}
              data-testid="input-prompt"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 w-10 h-10 rounded-lg cosmic-glow-cyan bg-accent hover:bg-accent/80 text-black"
              disabled={!prompt.trim() || orchestrate.isPending}
              data-testid="button-send-prompt"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
