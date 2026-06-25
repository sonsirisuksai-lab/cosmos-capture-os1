import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { recordFeedback } from "@/lib/ai/learning";
import type { AIProvider } from "@/lib/ai/intelligence";

interface FeedbackWidgetProps {
  input: string;
  response: string;
  agent: string;
  provider: AIProvider;
  onDone?: () => void;
}

export function FeedbackWidget({ input, response, agent, provider, onDone }: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = async (r: number) => {
    setRating(r);
    await recordFeedback({
      input,
      response,
      rating: r,
      liked: r >= 4,
      agent,
      provider,
      tags: [],
    });
    setTimeout(() => {
      setSubmitted(true);
      onDone?.();
    }, 500);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-3 text-xs text-muted-foreground">
        <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
        <span>Feedback saved — crew is learning</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1.5 px-1">
      <span className="text-xs text-muted-foreground">Rate this response:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onMouseEnter={() => setHovered(r)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleSubmit(r)}
            className="transition-transform hover:scale-125"
            title={`${r} star${r > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                (hovered ?? rating ?? 0) >= r
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      {rating === null && (
        <div className="flex gap-2 ml-1">
          <button
            onClick={() => handleSubmit(5)}
            className="text-muted-foreground hover:text-green-400 transition-colors"
            title="Helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleSubmit(1)}
            className="text-muted-foreground hover:text-red-400 transition-colors"
            title="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
