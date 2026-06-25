import { useEffect, useState } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import { generateRecommendations } from "@/lib/ai/learning";

interface RecommendationsProps {
  noteCount?: number;
  className?: string;
}

export function Recommendations({ noteCount = 0, className = "" }: RecommendationsProps) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const recs = await generateRecommendations(noteCount);
      setItems(recs);
    } catch {
      setItems([
        "📝 Add notes to your Knowledge Vault",
        "🌌 Explore Universe OS to manage life domains",
        "🔮 Run a Simulation to predict your trajectory",
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [noteCount]);

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/30 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Proactive Recommendations
          </span>
        </div>
        <button
          onClick={load}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 rounded bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((rec, i) => (
            <li
              key={i}
              className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed"
            >
              <span className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
