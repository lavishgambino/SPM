import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, ShieldCheck, Activity, RefreshCw } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { revealChat14 } from "@/hooks/use-reveal-flags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import userAvatar from "@/assets/avatars/mary.svg";
import iconHome from "@/assets/nav/home.svg";
import iconNotifications from "@/assets/nav/notifications.svg";
import iconSearch from "@/assets/nav/search.svg";
import iconBrowse from "@/assets/nav/browse.svg";
import iconRecents from "@/assets/nav/recents.svg";
import iconFavorites from "@/assets/nav/favorites.svg";
import iconPlanning from "@/assets/nav/planning.svg";
import iconCreate from "@/assets/nav/create.svg";
import iconHelp from "@/assets/nav/help.svg";
import iconLauncher from "@/assets/nav/launcher.svg";

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  showLabel?: boolean;
  to?: string;
  activeWhenNotHome?: boolean;
  containerBg?: string;
}

const TOP_ITEMS: NavItem[] = [
  { icon: iconHome, label: "Home", showLabel: true, to: "/" },
  { icon: iconNotifications, label: "Alerts", badge: 1, showLabel: true },
  { icon: iconSearch, label: "Search", showLabel: true },
  { icon: iconBrowse, label: "Browse", showLabel: true },
  { icon: iconRecents, label: "Recents", showLabel: true },
  { icon: iconFavorites, label: "Favorites", showLabel: true },
  { icon: iconPlanning, label: "Arc", showLabel: true, activeWhenNotHome: true },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: iconLauncher, label: "Launcher" },
  { icon: iconHelp, label: "Help", to: "__reveal_all__" },
];

const NavButton = ({ item }: { item: NavItem }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive =
    item.active ||
    (item.to && location.pathname === item.to) ||
    (item.activeWhenNotHome && location.pathname !== "/");
  return (
    <button
      title={item.label}
      onClick={() => {
        if (item.to === "__reveal_all__") {
          sessionStorage.setItem("arc_new_chat_created", "true");
          revealChat14();
          localStorage.setItem("arc:disclosure:full", "1");
          window.dispatchEvent(new Event("arc:disclosure:changed"));
          return;
        }
        if (item.to) navigate(item.to);
      }}
      className="max-w-10 px-1 flex flex-col items-center justify-center gap-0.5 relative cursor-pointer"
    >
      <div
        className={`relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden transition-colors ${
          item.containerBg ? "" : isActive ? "bg-white/20" : "hover:bg-white/10"
        }`}
        style={item.containerBg ? { background: item.containerBg } : undefined}
      >
        <img
          src={item.icon}
          alt=""
          className={
            item.containerBg
              ? "w-5 h-5"
              : item.label === "Arc"
              ? "w-[18px] h-[18px]"
              : "w-8 h-8"
          }
        />
        {item.badge !== undefined && (
          <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-[hsl(11_64%_44%)] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
            {item.badge}
          </span>
        )}
      </div>
      {item.showLabel && item.label && (
        <span className="text-[10px] font-semibold text-white leading-3 text-center">
          {item.label}
        </span>
      )}
    </button>
  );
};

const SmartsheetNav = () => {
  const { theme, toggle } = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);
  const gradient =
    theme === "dark"
      ? "linear-gradient(135deg, #0E2A78 0%, #2E1F8A 100%)"
      : "linear-gradient(135deg, #184BC3 0%, #5A43D7 100%)";


  return (
    <div
      className="hidden md:flex w-[72px] h-screen sticky top-0 flex-col items-center py-4 flex-shrink-0"
      style={{ background: gradient }}
    >
      <div className="flex-1 flex flex-col items-center gap-3 w-full">
        {TOP_ITEMS.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}

        {/* Create button */}
        <button
          title="Create"
          className="mt-1 flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={iconCreate} alt="" className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold text-white leading-3">Create</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">


        {BOTTOM_ITEMS.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
        {/* Account avatar */}
        <button
          title="About Mary"
          onClick={() => setAboutOpen(true)}
          className="max-w-10 px-1 flex flex-col items-center cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/40 hover:ring-white/70 transition-all">
            <img src={userAvatar} alt="Mary" className="w-full h-full object-cover" />
          </div>
        </button>
      </div>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-xl p-10 border-border bg-background">
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-border flex-shrink-0">
              <img src={userAvatar} alt="Mary" className="w-full h-full object-cover" />
            </div>
            <DialogHeader className="text-center space-y-1 items-center">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
                Mary Chen
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                EPMO Director
              </DialogDescription>
            </DialogHeader>
            <p className="text-base text-foreground leading-relaxed max-w-md">
              Mary needs to build an aligned, governed plan across the organization — and then monitor
              execution and replan as reality changes. Arc is her AI planning partner.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};



export default SmartsheetNav;
