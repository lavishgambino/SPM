import ClaudeLogo from "./ClaudeLogo";

const TypingIndicator = () => (
  <div className="py-5">
    <div className="max-w-3xl mx-auto px-4 md:px-0">
      <div className="flex gap-4">
        <div className="w-7 h-7 rounded-full bg-claude-orange flex items-center justify-center flex-shrink-0 mt-0.5">
          <ClaudeLogo className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-1.5 pt-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  </div>
);

export default TypingIndicator;
