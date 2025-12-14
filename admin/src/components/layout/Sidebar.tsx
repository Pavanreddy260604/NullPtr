import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu, // Hamburger for opening
  X,
  Sun,
  Moon,
  Palette
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- GLOBAL THEME HOOK ---
const useGlobalTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("global-theme") === "dark" ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("global-theme", theme);
  }, [theme]);

  const toggleGlobalTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");
  return { theme, toggleGlobalTheme };
};

/* --- MAIN COMPONENT --- */

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Subjects", path: "/subjects" },
  { icon: Layers, label: "Units", path: "/units" },
  { icon: HelpCircle, label: "Questions", path: "/questions" },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Theme States
  const { theme: globalTheme, toggleGlobalTheme } = useGlobalTheme();
  const [sidebarTheme, setSidebarTheme] = useState<"light" | "dark">("dark"); // Default Sidebar to Dark

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile, setMobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const toggleSidebarTheme = () => setSidebarTheme(prev => prev === "light" ? "dark" : "light");

  // --- EXACT COLOR STYLES ---
  const isDark = sidebarTheme === "dark";

  const styles = {
    // Backgrounds
    container: isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200",
    header: isDark ? "border-white/10" : "border-slate-100",
    footer: isDark ? "border-white/10" : "border-slate-100",

    // Text
    text: isDark ? "text-slate-400" : "text-slate-600",
    textHighlight: isDark ? "text-white" : "text-slate-900",

    // Interactables
    hover: isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-slate-100 hover:text-slate-900",
    activeLink: "bg-primary text-primary-foreground shadow-md font-medium", // Solid Primary Color (Original style)

    // Controls Background
    controlsBg: isDark ? "bg-black/20" : "bg-slate-100",
  };

  /* --- INNER CONTENT --- */
  const NavContent = () => (
    <div className={cn("flex flex-col h-full border-r transition-colors duration-300", styles.container)}>

      {/* 1. Header */}
      <div className={cn(
        "h-16 flex items-center border-b transition-all duration-300",
        styles.header,
        collapsed && !isMobile ? "justify-center px-0" : "justify-between px-4"
      )}>
        {/* Logo: HIDDEN when collapsed */}
        {(!collapsed || isMobile) ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className={cn("font-bold text-lg tracking-tight whitespace-nowrap", styles.textHighlight)}>
              EduAdmin
            </span>
          </motion.div>
        ) : (
          <div className="hidden" /> // Spacer
        )}

        {/* Toggle Button */}
        {isMobile ? (
          // Mobile: Close 'X'
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className={cn("h-8 w-8", styles.text, styles.hover)}>
            <X className="w-5 h-5" />
          </Button>
        ) : (
          // Desktop Toggle
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("h-8 w-8 transition-colors", styles.text, styles.hover)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {/* HERE IS THE FIX: Hamburger (Menu) if Collapsed, Arrow if Open */}
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {/* 2. Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative text-sm",
                isActive ? styles.activeLink : cn(styles.text, styles.hover),
                collapsed && !isMobile && "justify-center px-2"
              )
            }
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && !isMobile && "w-6 h-6")} />

            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {item.label}
              </motion.span>
            )}

            {/* Hover Tooltip (Collapsed) */}
            {collapsed && !isMobile && (
              <div className={cn(
                "absolute left-14 px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap text-xs border font-medium pointer-events-none",
                isDark ? "bg-slate-800 text-white border-slate-700" : "bg-white text-slate-900 border-slate-200"
              )}>
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. Footer */}
      <div className={cn("p-4 border-t", styles.footer)}>
        <div className={cn("flex flex-col gap-2", collapsed && !isMobile ? "items-center" : "")}>

          {/* Theme Toggles */}
          <div className={cn(
            "flex gap-1 p-1 rounded-lg mb-2 transition-colors",
            styles.controlsBg,
            collapsed && !isMobile ? "flex-col" : "flex-row justify-between"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleGlobalTheme}
              className={cn("h-7 w-full rounded-md transition-colors", styles.text, styles.hover)}
              title="Website Theme"
            >
              {globalTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarTheme}
              className={cn("h-7 w-full rounded-md transition-colors", styles.text, styles.hover)}
              title="Sidebar Theme"
            >
              <Palette className="w-4 h-4" />
            </Button>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full transition-colors h-9",
              isDark
                ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                : "text-slate-600 hover:text-red-600 hover:bg-red-50",
              collapsed && !isMobile ? "justify-center px-0" : "justify-start gap-3"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 shadow-xl overflow-hidden"
      >
        <NavContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl flex flex-col"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;