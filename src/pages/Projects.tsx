import { useState } from "react";
import { Plus, Search, Lock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FloatingSidebar from "@/components/claude/FloatingSidebar";
import SmartsheetNav from "@/components/claude/SmartsheetNav";
import PageHeader from "@/components/claude/PageHeader";
import { revealChat14 } from "@/hooks/use-reveal-flags";

const SIDEBAR_CONVERSATIONS = [
];

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  isPrivate: boolean;
}

const sampleProjects: Project[] = [
  { id: "1", name: "Website Redesign", updatedAt: "Updated 1 hour ago", isPrivate: true },
  { id: "2", name: "Arc Planning", updatedAt: "Updated 20 days ago", isPrivate: true },
  { id: "3", name: "Metrics", updatedAt: "Updated 23 days ago", isPrivate: true },
];

const tabs = ["Your projects", "Team", "Shared with you"] as const;

const Projects = () => {
  const navigate = useNavigate();
  const [projects] = useState<Project[]>(sampleProjects);
  const [activeTab, setActiveTab] = useState<string>("Your projects");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SmartsheetNav />
      <div
        className="flex-1 relative min-w-0 transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: "var(--content-left-inner)" }}
      >
        <FloatingSidebar
          conversations={SIDEBAR_CONVERSATIONS}
          activeId={null}
          onSelect={(id) => navigate(`/projects/2/chat/${id}`)}
          onNewChat={() => {
            revealChat14();
            navigate(`/projects/2/chat/14`);
          }}
        />

        <div className="h-full flex flex-col min-w-0">
        <PageHeader
          title="Projects"
          trailing={
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <Plus className="w-4 h-4" />
              New project
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 pt-2 pb-20">

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Tabs + sort */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sort by
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-foreground text-sm">
                  Activity
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            {/* Project cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}/chat/11`)}
                  className="text-left rounded-xl border border-border bg-card p-5 hover:border-muted-foreground/30 transition-all cursor-pointer min-h-[120px] flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{project.name}</span>
                    {project.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className="text-xs text-muted-foreground mt-auto">{project.updatedAt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Projects;
