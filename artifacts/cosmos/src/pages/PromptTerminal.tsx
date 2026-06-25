import { useState, useRef, useEffect } from "react";
import {
  useOrchestrate,
  useGetOrchestrateHistory,
  getGetOrchestrateHistoryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, TerminalSquare, Loader2, Sparkles, Brain, ChevronDown, ChevronUp,
  Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MakaInput } from "@/components/MakaInput";
import { Recommendations } from "@/components/Recommendations";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { callIntelligence, type AIProvider, type AIResponse } from "@/lib/ai/intelligence";
import { buildContext } from "@/lib/ai/context";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  agentEmoji?: string;
  provider?: AIProvider;
  confidence?: number;
  timestamp: number;
}

type Mode = "standard" | "intelligent";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PromptTerminal() {
  const [mode, setMode] = useState<Mode>("standard");
  const [aiProvider, setAiProvider] = useState<AIProvider>("mock");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showRecs, setShowRecs] = useState(true);

  // Standard mode (PostgreSQL API)
  const [stdPrompt, setStdPrompt] = useState("");
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
        setStdPrompt("");
      },
      onError: () => toast({ variant: "destructive", title: "Transmission Failed" }),
    },
  });

  // Intelligent mode (local IntelligenceEngine)
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [intelligentLoading, setIntelligentLoading] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const localScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    const el =
      mode === "standard"
        ? scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]")
        : localScrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, localMessages, orchestrate.isPending, intelligentLoading, mode]);

  // ─── Standard submit ─────────────────────────────────────────────────────────
  const handleStdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdPrompt.trim() || orchestrate.isPending) return;
    orchestrate.mutate({ data: { prompt: stdPrompt } });
  };

  // ─── Intelligent submit ──────────────────────────────────────────────────────
  const handleIntelligentSubmit = async (text: string) => {
    if (!text.trim() || intelligentLoading) return;

    const userMsg: LocalMessage = {
      id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    setIntelligentLoading(true);

    try {
      const ctx = await buildContext("commander", "");
      const aiRes: AIResponse = await callIntelligence(text, ctx, aiProvider, apiKey);

      const assistantMsg: LocalMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiRes.content,
        agentName: aiRes.agentName,
        agentEmoji: aiRes.agentEmoji,
        provider: aiRes.provider,
        confidence: aiRes.confidence,
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
      setFeedbackFor(assistantMsg.id);
    } catch (err) {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(), role: "assistant", content: `❌ Error: ${String(err)}`,
          agentName: "System", agentEmoji: "⚠️", timestamp: Date.now(),
        },
      ]);
    }
    setIntelligentLoading(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-5xl mx-auto animate-in fade-in duration-500 gap-4">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-sans tracking-tight">Maka Terminal</h1>
            <p className="text-muted-foreground font-mono text-xs">AI Crew Orchestrator · Phase 4</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("standard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === "standard" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Standard
          </button>
          <button
            onClick={() => setMode("intelligent")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === "intelligent" ? "bg-accent/20 text-accent border border-accent/30 cosmic-glow-cyan" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Intelligent
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-accent/40 text-accent">NEW</Badge>
          </button>
        </div>
      </header>

      {/* ── Intelligent Mode Settings Bar ── */}
      {mode === "intelligent" && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-sm">
          <span className="text-muted-foreground text-xs font-mono">AI Provider:</span>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value as AIProvider)}
            className="rounded-lg bg-background/60 border border-white/10 px-2 py-1 text-xs text-foreground"
          >
            <option value="mock">🤖 Mock (no key needed)</option>
            <option value="openrouter">🌐 OpenRouter (free tier)</option>
            <option value="gemini">✨ Gemini (free tier)</option>
          </select>

          {aiProvider !== "mock" && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={aiProvider === "openrouter" ? "sk-or-…" : "AIza…"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-7 text-xs bg-black/60 border-white/10 w-52 font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          <span className={`ml-auto text-xs font-mono ${aiProvider === "mock" ? "text-muted-foreground" : "text-green-400"}`}>
            {aiProvider === "mock" ? "🤖 Mock mode" : apiKey ? "🔑 Key set" : "⚠️ Needs key"}
          </span>
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0">

        {/* ── Main Chat Panel ── */}
        <Card className="flex-1 flex flex-col glass-panel overflow-hidden border-primary/20 min-h-0">

          {/* Standard Mode */}
          {mode === "standard" && (
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                  {historyLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : history?.length ? (
                    history.slice().reverse().map((entry) => (
                      <div key={entry.id} className="space-y-4">
                        <div className="flex justify-end">
                          <div className="bg-primary/20 text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] border border-primary/30 cosmic-glow shadow-sm text-sm">
                            {entry.prompt}
                          </div>
                        </div>
                        <div className="flex justify-start items-start gap-3 max-w-[85%]">
                          <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-xl shrink-0 mt-1 shadow-md">
                            {entry.agentEmoji}
                          </div>
                          <div className="space-y-1.5">
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
                        Try asking for strategic advice, health tips, coding help, or life goals.
                      </p>
                    </div>
                  )}
                  {orchestrate.isPending && (
                    <div className="flex justify-start items-start gap-3 max-w-[85%] animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                      </div>
                      <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Routing signal…
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 bg-background/50 border-t border-white/10">
                <form onSubmit={handleStdSubmit} className="relative flex items-center">
                  <Input
                    value={stdPrompt}
                    onChange={(e) => setStdPrompt(e.target.value)}
                    placeholder="Transmit prompt to crew…"
                    className="pr-12 bg-black/50 border-primary/30 focus-visible:ring-primary h-12 text-base rounded-xl font-mono shadow-inner"
                    disabled={orchestrate.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 w-10 h-10 rounded-lg cosmic-glow-cyan bg-accent hover:bg-accent/80 text-black"
                    disabled={!stdPrompt.trim() || orchestrate.isPending}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          )}

          {/* Intelligent Mode */}
          {mode === "intelligent" && (
            <>
              <ScrollArea className="flex-1 p-4" ref={localScrollRef}>
                <div className="space-y-6 pb-4">
                  {localMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                      <Brain className="w-12 h-12 mb-4 text-accent" />
                      <p className="font-mono text-sm">Intelligent mode ready.</p>
                      <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                        Context-aware AI that reads your notes, goals, and mood before responding.
                        {aiProvider === "mock" ? " Using crew mock responses (no API key needed)." : ` Using ${aiProvider} AI.`}
                      </p>
                    </div>
                  ) : (
                    localMessages.map((msg) => (
                      <div key={msg.id}>
                        {msg.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="bg-primary/20 text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] border border-primary/30 cosmic-glow shadow-sm text-sm">
                              {msg.content}
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-start items-start gap-3 max-w-[90%]">
                            <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-xl shrink-0 mt-1 shadow-md">
                              {msg.agentEmoji ?? "🤖"}
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-sm text-accent">{msg.agentName ?? "COSMOS"}</span>
                                {msg.provider && (
                                  <Badge variant="outline" className="text-[9px] uppercase bg-black/40 border-white/5 py-0">
                                    {msg.provider}
                                  </Badge>
                                )}
                                {msg.confidence && (
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {msg.confidence}% confidence
                                  </span>
                                )}
                              </div>
                              <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </div>
                              {feedbackFor === msg.id && (
                                <FeedbackWidget
                                  input={localMessages.find((m) => m.role === "user")?.content ?? ""}
                                  response={msg.content}
                                  agent={msg.agentName ?? "cosmos"}
                                  provider={msg.provider ?? "mock"}
                                  onDone={() => setFeedbackFor(null)}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {intelligentLoading && (
                    <div className="flex justify-start items-start gap-3 max-w-[85%] animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0 mt-1">
                        <Brain className="w-5 h-5 text-accent animate-pulse" />
                      </div>
                      <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Building context &amp; thinking…
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 bg-background/50 border-t border-white/10">
                <MakaInput onSubmit={handleIntelligentSubmit} loading={intelligentLoading} />
              </div>
            </>
          )}
        </Card>

        {/* ── Recommendations Sidebar ── */}
        {mode === "intelligent" && (
          <div className="w-64 flex flex-col gap-3 shrink-0">
            <button
              onClick={() => setShowRecs(!showRecs)}
              className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground px-1 transition-colors"
            >
              <span className="font-semibold uppercase tracking-wider">Intel Panel</span>
              {showRecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showRecs && (
              <Recommendations noteCount={history?.length ?? 0} className="flex-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
