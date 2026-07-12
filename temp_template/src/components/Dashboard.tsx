import React, { useState, useEffect } from "react";
import { 
  BarChart3, Inbox, FileText, Code2, GraduationCap, Award, MessageSquare, 
  Settings, Key, LogOut, ChevronRight, Plus, Pencil, Trash, Check, Eye, ExternalLink, 
  TrendingUp, Globe, Computer, ArrowLeft, RefreshCw, Star, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Profile, Skill, Experience, Project, Certificate, Blog, 
  Testimonial, Message, SocialLink, Setting, AnalyticsSummary 
} from "../types";

interface DashboardProps {
  onClose: () => void;
  portfolioData: any;
  refetchPortfolio: () => void;
}

export default function Dashboard({ onClose, portfolioData, refetchPortfolio }: DashboardProps) {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminToken, setAdminToken] = useState("");

  // UI Navigation
  const [activeTab, setActiveTab] = useState<"analytics" | "messages" | "projects" | "blogs" | "skills-exp" | "cert-test" | "profile-settings">("analytics");

  // Dynamic Data States
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(portfolioData?.profile || null);
  const [skills, setSkills] = useState<Skill[]>(portfolioData?.skills || []);
  const [experiences, setExperiences] = useState<Experience[]>(portfolioData?.experiences || []);
  const [projects, setProjects] = useState<Project[]>(portfolioData?.projects || []);
  const [certificates, setCertificates] = useState<Certificate[]>(portfolioData?.certificates || []);
  const [blogs, setBlogs] = useState<Blog[]>(portfolioData?.blogs || []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(portfolioData?.testimonials || []);
  const [socials, setSocials] = useState<SocialLink | null>(portfolioData?.socials || null);
  const [settings, setSettings] = useState<Setting | null>(portfolioData?.settings || null);

  // Loading & Updating states
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Update states
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });

  // Modal / Editor CRUD forms state
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);

  // Load Admin Token on Mount
  useEffect(() => {
    const token = localStorage.getItem("cms_admin_token");
    if (token === "developer-portfolio-cms-secure-token-2026") {
      setIsAuthenticated(true);
      setAdminToken(token);
    }
  }, []);

  // Fetch admin-protected data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Toast auto-clear
  useEffect(() => {
    if (actionMessage) {
      const t = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionMessage]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ type, text });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("cms_admin_token", data.token);
        setAdminToken(data.token);
        setIsAuthenticated(true);
        showToast("Welcome back, Admin!");
      } else {
        setAuthError(data.error || "Login credentials failed.");
      }
    } catch (err) {
      setAuthError("Failed to reach security node on the server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cms_admin_token");
    setIsAuthenticated(false);
    setAdminToken("");
    showToast("Logged out successfully.");
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${adminToken || "developer-portfolio-cms-secure-token-2026"}` }
      });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages", {
        headers: { Authorization: `Bearer ${adminToken || "developer-portfolio-cms-secure-token-2026"}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {}
  };

  // -------------------------------------------------------------
  // DATABASE PERSISTENCE UPDATE HANDLERS
  // -------------------------------------------------------------

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        showToast("Profile credentials updated!");
        refetchPortfolio();
      } else {
        showToast("Failed to save changes.", "error");
      }
    } catch (err) {
      showToast("Server network timeout.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(passForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Master Password updated!");
        setPassForm({ currentPassword: "", newPassword: "" });
      } else {
        showToast(data.error || "Password change rejected.", "error");
      }
    } catch (err) {
      showToast("Server connection error.", "error");
    }
  };

  const updateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socials) return;
    try {
      const res = await fetch("/api/admin/socials", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(socials)
      });
      if (res.ok) {
        showToast("Social links synced successfully!");
        refetchPortfolio();
      }
    } catch (err) {}
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast("Site configuration saved!");
        refetchPortfolio();
      }
    } catch (err) {}
  };

  // CRUD Helpers for generic listings
  const handleSaveCRUD = async (type: string, data: any, id?: string) => {
    const isEdit = !!id;
    const url = `/api/admin/${type}${isEdit ? `/${id}` : ""}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast(`${type.replace(/^\w/, c => c.toUpperCase())} details saved!`);
        setEditingItem(null);
        refetchPortfolio();
        
        // Reload listings locally
        if (type === "skills") {
          const updated = await fetch("/api/portfolio").then(r => r.json());
          setSkills(updated.skills);
        } else if (type === "experiences") {
          const updated = await fetch("/api/portfolio").then(r => r.json());
          setExperiences(updated.experiences);
        } else if (type === "projects") {
          const updated = await fetch("/api/portfolio").then(r => r.json());
          setProjects(updated.projects);
        } else if (type === "blogs") {
          const updated = await fetch("/api/portfolio").then(r => r.json());
          setBlogs(updated.blogs);
        } else if (type === "certificates") {
          const updated = await fetch("/api/portfolio").then(r => r.json());
          setCertificates(updated.certificates);
        } else if (type === "testimonials") {
          const updated = await fetch("/api/portfolio").then(r => r.json());
          setTestimonials(updated.testimonials);
        }
      } else {
        showToast("Error processing data payload.", "error");
      }
    } catch (err) {
      showToast("Server execution error.", "error");
    }
  };

  const handleDeleteCRUD = async (type: string, id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this item? This action is irreversible.")) return;

    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        showToast(`${type.replace(/^\w/, c => c.toUpperCase())} item removed.`);
        refetchPortfolio();
        
        if (type === "skills") setSkills(skills.filter(s => s.id !== id));
        else if (type === "experiences") setExperiences(experiences.filter(e => e.id !== id));
        else if (type === "projects") setProjects(projects.filter(p => p.id !== id));
        else if (type === "blogs") setBlogs(blogs.filter(b => b.id !== id));
        else if (type === "certificates") setCertificates(certificates.filter(c => c.id !== id));
        else if (type === "testimonials") setTestimonials(testimonials.filter(t => t.id !== id));
      }
    } catch (err) {}
  };

  // Inbox operations
  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, readStatus: "Read" } : m));
        showToast("Message marked as read!");
      }
    } catch (err) {}
  };

  const handleMarkReplied = async (id: string, currentStatus: "Pending" | "Replied") => {
    const nextStatus = currentStatus === "Pending" ? "Replied" : "Pending";
    try {
      const res = await fetch(`/api/admin/messages/${id}/reply`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ replyStatus: nextStatus })
      });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, replyStatus: nextStatus } : m));
        showToast("Reply status updated!");
      }
    } catch (err) {}
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        showToast("Message deleted successfully.");
      }
    } catch (err) {}
  };

  // Sync state with portfolio data if it loads later
  useEffect(() => {
    if (portfolioData) {
      if (!profile) setProfile(portfolioData.profile);
      if (skills.length === 0) setSkills(portfolioData.skills);
      if (experiences.length === 0) setExperiences(portfolioData.experiences);
      if (projects.length === 0) setProjects(portfolioData.projects);
      if (certificates.length === 0) setCertificates(portfolioData.certificates);
      if (blogs.length === 0) setBlogs(portfolioData.blogs);
      if (testimonials.length === 0) setTestimonials(portfolioData.testimonials);
      if (!socials) setSocials(portfolioData.socials);
      if (!settings) setSettings(portfolioData.settings);
    }
  }, [portfolioData]);

  // -------------------------------------------------------------
  // SECURE AUTH SCREEN (IF NOT AUTHENTICATED)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div id="admin-auth-panel" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 px-6 font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto mb-6">
            <Key className="h-5 w-5" />
          </div>

          <h2 className="text-xl font-sans font-bold text-zinc-100">Roihan CMS Portal</h2>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
            Please enter your master credentials to unlock administrative settings, project CRUD controllers, and contact inboxes.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password (default: admin)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-blue-500/80 transition-colors placeholder:text-zinc-700"
                required
              />
            </div>
            {authError && (
              <p className="text-xs text-red-400 font-mono text-left">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20"
            >
              Authenticate Master Node
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/60">
            <button
              onClick={onClose}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER COMPLETE ADMIN DASHBOARD CMS
  // -------------------------------------------------------------
  return (
    <div id="admin-cms-dashboard" className="fixed inset-0 z-50 bg-zinc-950 text-zinc-300 flex flex-col font-sans overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono shadow-xl ${
              actionMessage.type === "success" 
                ? "bg-zinc-900 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5" 
                : "bg-zinc-900 border-red-500/30 text-red-400 shadow-red-500/5"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full inline-block ${actionMessage.type === "success" ? "bg-emerald-400" : "bg-red-400"}`}></span>
            {actionMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-mono font-bold">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-sans font-bold text-zinc-100 flex items-center gap-2">
              Roihan Workspace <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/5 border border-blue-500/20 text-blue-400">ADMIN</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">CMS Node Active - Port 3000</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            title="Refresh database records"
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer text-xs font-mono"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Exit CMS
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900/40 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-medium text-zinc-500 px-3 py-2 uppercase tracking-wider">MONITORING</p>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "analytics" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Traffic & Analytics
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center justify-between transition-all cursor-pointer ${
                activeTab === "messages" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="h-4 w-4" /> Message Inbox
              </span>
              {messages.filter(m => m.readStatus === "Unread").length > 0 && (
                <span className="h-4.5 px-1.5 rounded-full bg-red-500 text-[10px] text-white font-mono flex items-center justify-center shrink-0">
                  {messages.filter(m => m.readStatus === "Unread").length}
                </span>
              )}
            </button>

            <p className="text-[10px] font-mono font-medium text-zinc-500 px-3 py-2 uppercase tracking-wider mt-6 inline-block">PORTFOLIO CMS</p>
            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "projects" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="h-4 w-4" /> Manage Projects
            </button>
            <button
              onClick={() => setActiveTab("blogs")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "blogs" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="h-4 w-4" /> Manage Blogs
            </button>
            <button
              onClick={() => setActiveTab("skills-exp")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "skills-exp" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Code2 className="h-4 w-4" /> Skills & Timeline
            </button>
            <button
              onClick={() => setActiveTab("cert-test")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "cert-test" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Award className="h-4 w-4" /> Certs & Testimonials
            </button>

            <p className="text-[10px] font-mono font-medium text-zinc-500 px-3 py-2 uppercase tracking-wider mt-6 inline-block">CONFIGURATION</p>
            <button
              onClick={() => setActiveTab("profile-settings")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "profile-settings" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Settings className="h-4 w-4" /> Profile & Settings
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/40 border border-zinc-800 text-center text-[10px] font-mono text-zinc-600">
            Node Server running: OK<br />
            Database sync: Local JSON
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="flex-1 p-8 overflow-y-auto bg-zinc-900/10">

          {/* TAB 1: VISITOR ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-8 max-w-6xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-sans font-bold text-zinc-100">Visitor Analytics Dashboard</h2>
                  <p className="text-xs text-zinc-500 font-sans mt-1">Real-time telemetry logging of pages views and traffic geographical spread.</p>
                </div>
                <div className="flex gap-2 text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
                  <span>SYSTEM: <span className="text-emerald-400">ONLINE</span></span>
                  <span className="text-zinc-700">|</span>
                  <span>VIEWS: <span className="text-blue-400">{analytics?.totalPageViews || 0}</span></span>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center text-zinc-500 text-xs font-mono">
                    <span>UNIQUE VISITORS</span>
                    <Globe className="h-4 w-4 text-zinc-500" />
                  </div>
                  <h3 className="text-3xl font-sans font-extrabold text-zinc-100 mt-2">{analytics?.totalVisitors || 0}</h3>
                  <p className="text-[10px] text-emerald-400 font-mono mt-2.5 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> +20% from last month
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center text-zinc-500 text-xs font-mono">
                    <span>PAGE VIEWS</span>
                    <Computer className="h-4 w-4 text-zinc-500" />
                  </div>
                  <h3 className="text-3xl font-sans font-extrabold text-zinc-100 mt-2">{analytics?.totalPageViews || 0}</h3>
                  <p className="text-[10px] text-emerald-400 font-mono mt-2.5 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Real-time active tracking
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center text-zinc-500 text-xs font-mono">
                    <span>TOTAL INBOX</span>
                    <Inbox className="h-4 w-4 text-zinc-500" />
                  </div>
                  <h3 className="text-3xl font-sans font-extrabold text-zinc-100 mt-2">{messages.length}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-2.5">
                    {messages.filter(m => m.readStatus === "Unread").length} unread messages
                  </p>
                </div>
              </div>

              {/* Graphic charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Custom SVG Traffic Line/Area Chart */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4 flex items-center gap-1.5">
                    Traffic Volume <span className="text-[10px] font-mono font-normal text-zinc-500">(Views by Day)</span>
                  </h3>
                  
                  {/* SVG Chart */}
                  <div className="h-48 w-full relative flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      {/* Gradient */}
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area */}
                      <path 
                        d="M 0,40 Q 20,15 40,25 T 80,10 T 100,20 L 100,40 L 0,40 Z" 
                        fill="url(#chart-grad)" 
                      />
                      
                      {/* Line */}
                      <path 
                        d="M 0,40 Q 20,15 40,25 T 80,10 T 100,20" 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="1.2" 
                      />
                    </svg>

                    {/* Day tags */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] font-mono text-zinc-600 mt-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* Popular Pages list */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4">Popular Page Paths</h3>
                  <div className="space-y-4">
                    {analytics?.pageViewsByPage && Object.entries(analytics.pageViewsByPage).map(([page, count], idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                          <span className="text-zinc-400">{page}</span>
                          <span className="text-zinc-200">{count} views</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${Math.min(100, (Number(count) / (analytics.totalPageViews || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Geographic Logs Table */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4">Geographic Visitor logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-500 font-mono">
                        <th className="py-2.5">COUNTRY</th>
                        <th className="py-2.5">PAGE TARGET</th>
                        <th className="py-2.5">IP NODE</th>
                        <th className="py-2.5">TIMESTAMP (UTC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-zinc-300">
                      {analytics?.recentViews && analytics.recentViews.slice(0, 8).map((view, idx) => (
                        <tr key={idx} className="hover:bg-zinc-850/30 transition-colors">
                          <td className="py-2.5 font-medium flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                            {view.country}
                          </td>
                          <td className="py-2.5 font-mono text-zinc-400">{view.page}</td>
                          <td className="py-2.5 font-mono text-zinc-500">{view.ip}</td>
                          <td className="py-2.5 text-zinc-500">{new Date(view.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INBOX MESSAGE BOX */}
          {activeTab === "messages" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-sans font-bold text-zinc-100">Message Inbox ({messages.length})</h2>
                <p className="text-xs text-zinc-500 font-sans mt-1">Review, delete, and reply to prospective employers and client leads.</p>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans">
                  No messages received yet. Submit the contact form to see messages populate here.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-6 rounded-2xl border transition-all ${
                        msg.readStatus === "Unread" 
                          ? "bg-blue-600/5 border-blue-500/30 shadow-md shadow-blue-500/5" 
                          : "bg-zinc-900 border-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-semibold text-sm text-zinc-100">{msg.name}</h3>
                            <span className="text-zinc-600 font-mono text-xs">•</span>
                            <span className="text-xs font-mono text-zinc-400">{msg.email}</span>
                          </div>
                          <p className="text-xs font-mono text-zinc-500 mt-1">Received {new Date(msg.date).toLocaleDateString()} at {new Date(msg.date).toLocaleTimeString()}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {msg.readStatus === "Unread" && (
                            <button
                              onClick={() => handleMarkRead(msg.id)}
                              className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-500"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleMarkReplied(msg.id, msg.replyStatus)}
                            className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded-lg cursor-pointer ${
                              msg.replyStatus === "Replied" 
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {msg.replyStatus === "Replied" ? "✓ Replied" : "Mark Replied"}
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850/60">
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest text-[10px]">SUBJECT: {msg.subject}</p>
                        <p className="text-xs font-sans text-zinc-300 mt-2 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS CMS */}
          {activeTab === "projects" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-sans font-bold text-zinc-100">Project Collections ({projects.length})</h2>
                  <p className="text-xs text-zinc-500 font-sans mt-1">Manage project descriptions, technical tags, screenshots, and repository routes.</p>
                </div>
                <button
                  onClick={() => setEditingItem({
                    type: "projects",
                    data: { title: "", category: "Backend Architecture", thumbnail: "", gallery: [], description: "", techStack: [], features: [], githubUrl: "#", liveUrl: "#", status: "Completed", featured: false, tags: [] }
                  })}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4 overflow-hidden relative">
                    <img 
                      src={proj.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"} 
                      alt={proj.title}
                      className="h-20 w-28 rounded-lg object-cover shrink-0 bg-zinc-950 border border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-sans font-bold text-sm text-zinc-100 truncate">{proj.title}</h3>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setEditingItem({ type: "projects", data: proj })}
                            className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCRUD("projects", proj.id)}
                            className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{proj.category}</span>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{proj.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {proj.techStack.slice(0, 4).map((tech, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-500">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BLOGS CMS */}
          {activeTab === "blogs" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-sans font-bold text-zinc-100">Blog Posts ({blogs.length})</h2>
                  <p className="text-xs text-zinc-500 font-sans mt-1">Publish architectural deep dives and technology insights for recruiters.</p>
                </div>
                <button
                  onClick={() => setEditingItem({
                    type: "blogs",
                    data: { title: "", content: "", category: "System Design", author: "Roihan", featuredImage: "", tags: [], status: "Published" }
                  })}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Blog Post
                </button>
              </div>

              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full inline-block ${blog.status === "Published" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                        <h3 className="font-sans font-bold text-sm text-zinc-100 hover:text-blue-400 transition-colors cursor-pointer truncate">{blog.title}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono mt-1">Published on {blog.publishDate} • {blog.readingTime} • Category: {blog.category}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem({ type: "blogs", data: blog })}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCRUD("blogs", blog.id)}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS & TIMELINE */}
          {activeTab === "skills-exp" && (
            <div className="space-y-12 max-w-6xl">
              
              {/* Skills section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Skills Progress Bars ({skills.length})</h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">Control tech stack categorization and strength meters.</p>
                  </div>
                  <button
                    onClick={() => setEditingItem({
                      type: "skills",
                      data: { category: "Backend", name: "", percentage: 80, icon: "code", order: 1, visibility: true }
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Skill
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-100">{skill.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({skill.category})</span>
                        </div>
                        <div className="h-1 w-28 bg-zinc-950 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${skill.percentage}%` }}></div>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingItem({ type: "skills", data: skill })}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCRUD("skills", skill.id)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Experiences Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Timeline Career Experiences ({experiences.length})</h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">Edit timelines, roles, companies, descriptions, and tag stacks.</p>
                  </div>
                  <button
                    onClick={() => setEditingItem({
                      type: "experiences",
                      data: { position: "", company: "", duration: "", description: "", technology: [], logo: "" }
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Job
                  </button>
                </div>

                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-sans font-bold text-sm text-zinc-100">{exp.position}</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-1">{exp.company} • {exp.duration}</p>
                        <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">{exp.description}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {exp.technology.map((tech, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-950 border border-zinc-850 text-zinc-500">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingItem({ type: "experiences", data: exp })}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCRUD("experiences", exp.id)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: CERTS & TESTIMONIALS */}
          {activeTab === "cert-test" && (
            <div className="space-y-12 max-w-6xl">
              
              {/* Certifications CMS */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Certifications Grid ({certificates.length})</h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">Publish certifications, badges, date bounds, and links.</p>
                  </div>
                  <button
                    onClick={() => setEditingItem({
                      type: "certificates",
                      data: { name: "", certificateImage: "", issuer: "", date: "", credentialUrl: "#" }
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Certificate
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-sans font-bold text-xs text-zinc-100">{cert.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{cert.issuer} • {cert.date}</p>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingItem({ type: "certificates", data: cert })}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCRUD("certificates", cert.id)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials CMS */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Client Testimonials ({testimonials.length})</h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">Manage customer references and star ratings on the layout.</p>
                  </div>
                  <button
                    onClick={() => setEditingItem({
                      type: "testimonials",
                      data: { name: "", position: "", company: "", comment: "", rating: 5, avatar: "" }
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Testimonial
                  </button>
                </div>

                <div className="space-y-4">
                  {testimonials.map((test) => (
                    <div key={test.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-sm text-zinc-100">{test.name}</h4>
                          <span className="text-zinc-600">•</span>
                          <span className="text-xs text-zinc-500">{test.position} at {test.company}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2.5 italic">"{test.comment}"</p>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingItem({ type: "testimonials", data: test })}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCRUD("testimonials", test.id)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: PROFILE & SYSTEM SETTINGS */}
          {activeTab === "profile-settings" && (
            <div className="space-y-8 max-w-4xl">
              
              {/* Profile details */}
              {profile && (
                <form onSubmit={updateProfile} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-zinc-400" /> Biography & Core Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">HEADLINE TITLE</label>
                      <input
                        type="text"
                        value={profile.headline}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">SUBTITLE SPECIALTY</label>
                      <input
                        type="text"
                        value={profile.subtitle}
                        onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">BRIEF DESCRIPTION</label>
                    <input
                      type="text"
                      value={profile.description}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">FULL BIOGRAPHY</label>
                    <textarea
                      value={profile.biography}
                      onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">PROFILE AVATAR URL</label>
                      <input
                        type="text"
                        value={profile.profileImage}
                        onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">EDUCATION LINE</label>
                      <input
                        type="text"
                        value={profile.education}
                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                    >
                      {loading ? "Saving Node Changes..." : "Save Bio Settings"}
                    </button>
                  </div>
                </form>
              )}

              {/* Social Links Form */}
              {socials && (
                <form onSubmit={updateSocials} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100">Social API Integration Links</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">GITHUB URL</label>
                      <input
                        type="text"
                        value={socials.github}
                        onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">LINKEDIN URL</label>
                      <input
                        type="text"
                        value={socials.linkedin}
                        onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                    >
                      Save Social Connections
                    </button>
                  </div>
                </form>
              )}

              {/* Password update Form */}
              <form onSubmit={updatePassword} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-sans font-semibold text-zinc-100 flex items-center gap-2">
                  <Key className="h-4 w-4 text-zinc-400" /> Rotate Security Passwords
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">CURRENT PASSWORD</label>
                    <input
                      type="password"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">NEW SECRET PASSWORD</label>
                    <input
                      type="password"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    Commit Password Rotation
                  </button>
                </div>
              </form>

            </div>
          )}

        </main>
      </div>

      {/* -------------------------------------------------------------
          MODAL DRAWER FOR CRUD DETAILS EDITOR
         ------------------------------------------------------------- */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 scrollbar-thin shadow-2xl"
            >
              <h3 className="text-base font-sans font-bold text-zinc-100 mb-6 uppercase tracking-wider">
                {editingItem.data.id ? "Edit Record" : "Create New Record"} - {editingItem.type}
              </h3>

              {/* PROJECTS FORM */}
              {editingItem.type === "projects" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">PROJECT TITLE</label>
                    <input
                      type="text"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">CATEGORY</label>
                      <input
                        type="text"
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">STATUS</label>
                      <select
                        value={editingItem.data.status}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">THUMBNAIL IMAGE URL</label>
                    <input
                      type="text"
                      value={editingItem.data.thumbnail}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, thumbnail: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">DESCRIPTION</label>
                    <textarea
                      value={editingItem.data.description}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">TECH STACK (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingItem.data.techStack) ? editingItem.data.techStack.join(", ") : ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, techStack: e.target.value.split(",").map(s => s.trim()) } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">TAGS (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingItem.data.tags) ? editingItem.data.tags.join(", ") : ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, tags: e.target.value.split(",").map(s => s.trim()) } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">GITHUB REPO URL</label>
                      <input
                        type="text"
                        value={editingItem.data.githubUrl}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, githubUrl: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">LIVE DEMO URL</label>
                      <input
                        type="text"
                        value={editingItem.data.liveUrl}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, liveUrl: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.data.featured}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, featured: e.target.checked } })}
                      className="rounded bg-zinc-950 border-zinc-800 text-blue-600 focus:ring-0"
                    />
                    <label className="text-[10px] font-mono text-zinc-400">FEATURED ON PORTFOLIO HOME</label>
                  </div>
                </div>
              )}

              {/* BLOGS FORM */}
              {editingItem.type === "blogs" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">BLOG TITLE</label>
                    <input
                      type="text"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">CATEGORY</label>
                      <input
                        type="text"
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">STATUS</label>
                      <select
                        value={editingItem.data.status}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">FEATURED COVER IMAGE URL</label>
                    <input
                      type="text"
                      value={editingItem.data.featuredImage}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, featuredImage: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">MARKDOWN MARKUP CONTENT</label>
                    <textarea
                      value={editingItem.data.content}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                      rows={8}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SKILLS FORM */}
              {editingItem.type === "skills" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">SKILL NAME</label>
                    <input
                      type="text"
                      value={editingItem.data.name}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">CATEGORY</label>
                      <select
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      >
                        <option value="Backend">Backend</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Database">Database</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">STRENGTH PERCENTAGE (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingItem.data.percentage}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, percentage: Number(e.target.value) } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EXPERIENCES TIMELINE FORM */}
              {editingItem.type === "experiences" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">POSITION TITLE</label>
                      <input
                        type="text"
                        value={editingItem.data.position}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, position: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">COMPANY NAME</label>
                      <input
                        type="text"
                        value={editingItem.data.company}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, company: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">DURATION (e.g. 2024 - Present)</label>
                      <input
                        type="text"
                        value={editingItem.data.duration}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, duration: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">TECH USED (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingItem.data.technology) ? editingItem.data.technology.join(", ") : ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, technology: e.target.value.split(",").map(s => s.trim()) } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">DESCRIPTION</label>
                    <textarea
                      value={editingItem.data.description}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS FORM */}
              {editingItem.type === "certificates" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">CERTIFICATE NAME</label>
                    <input
                      type="text"
                      value={editingItem.data.name}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">ISSUER</label>
                      <input
                        type="text"
                        value={editingItem.data.issuer}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, issuer: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">DATE RECEIVED</label>
                      <input
                        type="text"
                        value={editingItem.data.date}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">CREDENTIAL LINK / URL</label>
                    <input
                      type="text"
                      value={editingItem.data.credentialUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, credentialUrl: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                </div>
              )}

              {/* TESTIMONIALS FORM */}
              {editingItem.type === "testimonials" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">CLIENT NAME</label>
                      <input
                        type="text"
                        value={editingItem.data.name}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">COMPANY NAME</label>
                      <input
                        type="text"
                        value={editingItem.data.company}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, company: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">POSITION / TITLE</label>
                    <input
                      type="text"
                      value={editingItem.data.position}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, position: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 mb-1">TESTIMONIAL COMMENT</label>
                    <textarea
                      value={editingItem.data.comment}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, comment: e.target.value } })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 border-t border-zinc-800 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCRUD(editingItem.type, editingItem.data, editingItem.data.id)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium cursor-pointer"
                >
                  Commit Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
