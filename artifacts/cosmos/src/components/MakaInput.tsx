import { useState, useRef } from "react";
import { Send, Paperclip, Link, Mic, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MakaInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
  placeholder?: string;
}

export function MakaInput({ onSubmit, loading, placeholder }: MakaInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!text.trim() || loading) return;
    onSubmit(text.trim());
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const iconBtnClass =
    "text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg p-1.5 transition-colors";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 shadow-inner">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder ?? "Transmit to crew… (Enter to send, Shift+Enter for new line)"
        }
        rows={2}
        disabled={loading}
        className="w-full resize-none border-none bg-transparent px-4 pt-3 pb-1 text-sm font-mono text-slate-200 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex gap-1">
          <button className={iconBtnClass} title="Attach file">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className={iconBtnClass} title="Paste link">
            <Link className="w-4 h-4" />
          </button>
          <button className={iconBtnClass} title="Voice input">
            <Mic className="w-4 h-4" />
          </button>
          <button className={iconBtnClass} title="Attach image">
            <Image className="w-4 h-4" />
          </button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          size="sm"
          className="rounded-xl bg-accent hover:bg-accent/80 text-black font-semibold gap-1.5 cosmic-glow-cyan"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Processing…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Send
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
