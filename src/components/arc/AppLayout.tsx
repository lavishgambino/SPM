import { ReactNode } from "react";
import FloatingSidebar from "@/components/claude/FloatingSidebar";
import SmartsheetNav from "@/components/claude/SmartsheetNav";
import PageHeader from "@/components/claude/PageHeader";
import { useNavigate } from "react-router-dom";
import { setItemState, markItemComplete } from "@/hooks/use-phase-state";
import { useChat14Revealed, revealChat14 } from "@/hooks/use-reveal-flags";

const ALL_CONVERSATIONS = [
  { id: "11", title: "Setting up first plan", date: "today", group: "FY27 Planning" },
  { id: "11f", title: "FY27 plan creation", date: "today", group: "FY27 Planning" },
  { id: "14f", title: "Budget deep dive", date: "today", group: "FY27 Planning" },
  { id: "13", title: "Intake Review & Scenario Planning", date: "5 days ago", group: "FY27 Planning" },
  { id: "14", title: "Budget deep dive", date: "today", group: "FY27 Planning" },
];

const getConversations = () => {
  if (typeof window === "undefined") return ALL_CONVERSATIONS.filter((c) => ["11", "11f", "14f"].includes(c.id));
  const hasNewChat = sessionStorage.getItem("arc_new_chat_created") === "true";
  const hasChat14 = sessionStorage.getItem("arc_chat_14_revealed") === "true";
  return ALL_CONVERSATIONS.filter((c) => {
    if (c.id === "13") return hasNewChat;
    if (c.id === "14") return hasChat14;
    return true;
  });
};

interface AppLayoutProps {
  children: ReactNode;
  title?: ReactNode;
  titleIcon?: ReactNode;
  headerTrailing?: ReactNode;
}

export function AppLayout({ children, title, titleIcon, headerTrailing }: AppLayoutProps) {
  const navigate = useNavigate();
  // Subscribe so the conversations list re-renders when Search reveals chat 14.
  useChat14Revealed();

  const titleNode =
    title && (titleIcon || typeof title !== "string") ? (
      <div className="flex items-center gap-2 min-w-0">
        {titleIcon}
        {typeof title === "string" ? (
          <span className="text-base font-semibold text-foreground truncate">{title}</span>
        ) : (
          title
        )}
      </div>
    ) : (
      title
    );

  return (
    <div className="flex min-h-screen bg-background">
      <SmartsheetNav />
      <div
        className="flex-1 relative min-w-0 transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: "var(--content-left-inner)" }}
      >
        <FloatingSidebar
          conversations={getConversations()}
          activeId={null}
          onSelect={(id) => navigate(`/projects/2/chat/${id}`)}
          onNewChat={() => {
            revealChat14();
            navigate("/projects/2/chat/14");
          }}
        />
        <main className="min-h-screen overflow-auto flex flex-col">
          {title && <PageHeader title={titleNode} trailing={headerTrailing} />}
          <div className="px-8 pb-8 pt-2 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
