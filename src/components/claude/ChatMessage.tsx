interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className="py-5">
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        {role === "user" ? (
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-primary text-primary-foreground rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap bg-muted/60 rounded-2xl px-5 py-3.5">
              {content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
