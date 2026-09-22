import { useNavigate } from "react-router-dom";
import FloatingSidebar from "@/components/claude/FloatingSidebar";
import SmartsheetNav from "@/components/claude/SmartsheetNav";
import ChatInput from "@/components/claude/ChatInput";
import WelcomeScreen from "@/components/claude/WelcomeScreen";
import { revealChat14 } from "@/hooks/use-reveal-flags";

const ALL_SIDEBAR_CONVERSATIONS = [
  { id: "11", title: "Setting up first plan", date: "Today" },
  { id: "13", title: "Intake Review & Scenario Planning", date: "5 days ago" },
];

const getSidebarConversations = () => {
  const hasNewChat = typeof window !== "undefined" && sessionStorage.getItem("arc_new_chat_created") === "true";
  return hasNewChat ? ALL_SIDEBAR_CONVERSATIONS : ALL_SIDEBAR_CONVERSATIONS.filter((c) => c.id !== "13");
};

const Index = () => {
  const navigate = useNavigate();

  const handleSend = (text: string) => {
    const newChatId = Date.now().toString();
    navigate(`/projects/1/chat/${newChatId}`, {
      state: { initialMessage: text },
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SmartsheetNav />
      <div
        className="flex-1 relative min-w-0 transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: "var(--content-left-inner)" }}
      >
        <FloatingSidebar
          conversations={getSidebarConversations()}
          activeId={null}
          onSelect={(id) => navigate(`/projects/2/chat/${id}`)}
          onNewChat={() => {
            revealChat14();
            navigate(`/projects/2/chat/14`);
          }}
        />

        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <WelcomeScreen />
            <div className="w-full mt-6">
              <ChatInput
                onSend={handleSend}
                isLoading={false}
                placeholder="How can I help you today?"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
