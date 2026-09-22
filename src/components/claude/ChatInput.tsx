import { useState, useRef, KeyboardEvent } from "react";
import { ArrowUp, Paperclip, AtSign, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, isLoading, placeholder = "Ask anything about your strategy canvas..." }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const hasContent = input.trim().length > 0;

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 md:px-0 pb-4">
      <div
        className={`rounded-2xl bg-card/90 glass-card px-5 py-4 transition-all ${
          hasContent
            ? "border-2 border-primary/60 ring-2 ring-primary/20"
            : "border border-border/40"
        }`}
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          style={{ minHeight: "56px", maxHeight: "200px" }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-0.5">
            <button className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all">
              <AtSign className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 icon-tile bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
