import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart3, Inbox, FileText, Code2, Award, MessageSquare,
  Settings, Key, LogOut, Plus, Pencil, Trash, Check, Globe,
  Computer, ArrowLeft, RefreshCw, TrendingUp, Upload, X,
  AlertTriangle, Image, ExternalLink, ChevronDown, MousePointerClick, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Profile, Skill, Experience, Project, Certificate, Blog,
  Testimonial, Message, SocialLink, Setting, AnalyticsSummary
} from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  onClose: () => void;
  portfolioData: any;
  refetchPortfolio: () => void;
}

type TabId = "analytics" | "messages" | "projects" | "blogs" | "skills-exp" | "cert-test" | "profile-settings";

interface ConfirmModal {
  title: string;
  description: string;
  onConfirm: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTH_TOKEN = "developer-portfolio-cms-secure-token-2026";

const INPUT_CLS = "w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-700";
const LABEL_CLS = "block text-[11px] font-mono text-zinc-500 mb-1.5 uppercase tracking-wider";

function formatPagePath(path: string): string {
  if (path === "/" || path === "") return "Main Portfolio (Home)";
  if (path === "/index.html") return "Main Portfolio (Home)";
  if (path.includes("/src/") || path.includes("/node_modules/") || path.match(/\.(ts|tsx|jsx|json|css|js)$/)) {
    return "System Route (Dev Mode)";
  }
  return path;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}

// ─── Image Upload Button ───────────────────────────────────────────────────────

function ImageUploadButton({
  currentUrl,
  onUploaded,
  token,
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
  token: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onUploaded(data.url);
      }
    } catch {
      /* ignore — toast handled by parent */
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <img
          src={currentUrl}
          alt="preview"
          className="h-20 w-32 object-cover rounded-lg border border-zinc-800 bg-zinc-950"
        />
      )}
      <div className="flex gap-2">
        <input
          className={INPUT_CLS + " flex-1 truncate"}
          value={currentUrl}
          onChange={(e) => onUploaded(e.target.value)}
          placeholder="Paste image URL or upload..."
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmDialog({
  modal,
  onCancel,
}: {
  modal: ConfirmModal;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <h3 className="font-sans font-bold text-sm text-zinc-100">{modal.title}</h3>
        </div>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">{modal.description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { modal.onConfirm(); onCancel(); }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-sans font-medium cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Analytics SVG Chart ────────────────────────────────────────────────────

function TrafficChart({ visitorsByDay }: { visitorsByDay: Record<string, number> }) {
  const entries = Object.entries(visitorsByDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-600 text-xs font-mono">
        No traffic data yet
      </div>
    );
  }
  const values = entries.map(([, v]) => v);
  const max = Math.max(...values, 1);
  const W = 100, H = 40;
  const pts = entries.map(([, v], i) => {
    const x = (i / Math.max(entries.length - 1, 1)) * W;
    const y = H - (v / max) * (H * 0.85) - H * 0.05;
    return `${x},${y}`;
  });
  const areaPath = `M ${pts.join(" L ")} L ${W},${H} L 0,${H} Z`;
  const linePath = `M ${pts.join(" L ")}`;

  return (
    <div className="h-48 w-full relative">
      <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chart-grad)" />
        <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] font-mono text-zinc-600">
        {entries.map(([date]) => (
          <span key={date}>{date.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function Dashboard({ onClose, portfolioData, refetchPortfolio }: DashboardProps) {
  // Prevent background scrolling while CMS is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminToken, setAdminToken] = useState("");

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("analytics");

  // ── Remote data ───────────────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // ── Local editable state (mirrors portfolioData, updated on refetch) ──────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [socials, setSocials] = useState<SocialLink | null>(null);
  const [settings, setSettings] = useState<Setting | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [savingCRUD, setSavingCRUD] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);

  // ── Init from localStorage ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("cms_admin_token");
    if (token === AUTH_TOKEN) {
      setIsAuthenticated(true);
      setAdminToken(token);
    }
  }, []);

  // ── Sync local state from portfolioData whenever it changes ───────────────
  useEffect(() => {
    if (!portfolioData) return;
    setProfile(portfolioData.profile ?? null);
    setSkills(portfolioData.skills ?? []);
    setExperiences(portfolioData.experiences ?? []);
    setProjects(portfolioData.projects ?? []);
    setCertificates(portfolioData.certificates ?? []);
    setBlogs(portfolioData.blogs ?? []);
    setTestimonials(portfolioData.testimonials ?? []);
    setSocials(portfolioData.socials ?? null);
    setSettings(portfolioData.settings ?? null);
  }, [portfolioData]);

  // ── Fetch protected data after login ──────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchAnalytics();
      fetchMessages();
    }
  }, [isAuthenticated, adminToken]);

  // ── Toast auto-clear ──────────────────────────────────────────────────────
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (text: string, type: "success" | "error" = "success") => setToast({ type, text });

  const authHeader = useCallback(
    (extra?: Record<string, string>) => ({
      Authorization: `Bearer ${adminToken}`,
      ...extra,
    }),
    [adminToken]
  );

  // ── Auth handlers ─────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("cms_admin_token", data.token);
        setAdminToken(data.token);
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || "Login credentials failed.");
      }
    } catch {
      setAuthError("Failed to reach security node on the server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cms_admin_token");
    setIsAuthenticated(false);
    setAdminToken("");
  };

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics", { headers: authHeader() });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch { /* silent */ }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages", { headers: authHeader() });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch { /* silent */ }
  };

  // ── Settings / Profile handlers ───────────────────────────────────────────

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: authHeader({ "Content-Type": "application/json" }),
        body: JSON.stringify(profile),
      });
      if (res.ok) { showToast("Profile updated!"); refetchPortfolio(); }
      else showToast("Failed to save profile.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setLoading(false); }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: authHeader({ "Content-Type": "application/json" }),
        body: JSON.stringify(passForm),
      });
      const data = await res.json();
      if (res.ok) { showToast("Password rotated!"); setPassForm({ currentPassword: "", newPassword: "" }); }
      else showToast(data.error || "Password change rejected.", "error");
    } catch { showToast("Network error.", "error"); }
  };

  const updateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socials) return;
    try {
      const res = await fetch("/api/admin/socials", {
        method: "PUT",
        headers: authHeader({ "Content-Type": "application/json" }),
        body: JSON.stringify(socials),
      });
      if (res.ok) { showToast("Social links synced!"); refetchPortfolio(); }
      else showToast("Failed to update social links.", "error");
    } catch { showToast("Network error.", "error"); }
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: authHeader({ "Content-Type": "application/json" }),
        body: JSON.stringify(settings),
      });
      if (res.ok) { showToast("Site settings saved!"); refetchPortfolio(); }
      else showToast("Failed to update settings.", "error");
    } catch { showToast("Network error.", "error"); }
  };

  // ── Generic CRUD ──────────────────────────────────────────────────────────

  const handleSaveCRUD = async (type: string, data: any, id?: string) => {
    setSavingCRUD(true);
    try {
      const isEdit = !!id;
      
      // Parse raw strings into arrays for specific fields
      const submitData = { ...data };
      if (submitData.technologyRaw !== undefined) {
        submitData.technology = submitData.technologyRaw.split(",").map((s: string) => s.trim()).filter(Boolean);
        delete submitData.technologyRaw;
      }
      if (submitData.techStackRaw !== undefined) {
        submitData.techStack = submitData.techStackRaw.split(",").map((s: string) => s.trim()).filter(Boolean);
        delete submitData.techStackRaw;
      }
      if (submitData.tagsRaw !== undefined) {
        submitData.tags = submitData.tagsRaw.split(",").map((s: string) => s.trim()).filter(Boolean);
        delete submitData.tagsRaw;
      }

      const res = await fetch(`/api/admin/${type}${isEdit ? `/${id}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeader({ "Content-Type": "application/json" }),
        body: JSON.stringify(submitData),
      });
      if (res.ok) {
        showToast(`${type.replace(/^\w/, (c) => c.toUpperCase())} saved!`);
        setEditingItem(null);
        refetchPortfolio(); // single refetch, useEffect syncs all local state
      } else {
        showToast("Failed to save record.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSavingCRUD(false);
    }
  };

  const handleDeleteCRUD = (type: string, id: string, label = "this item") => {
    setConfirmModal({
      title: "Confirm Deletion",
      description: `Are you sure you want to permanently delete "${label}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/${type}/${id}`, {
            method: "DELETE",
            headers: authHeader(),
          });
          if (res.ok) {
            showToast("Item deleted.");
            refetchPortfolio();
          }
        } catch { showToast("Delete failed.", "error"); }
      },
    });
  };

  // ── Inbox handlers ────────────────────────────────────────────────────────

  const handleMarkRead = async (id: string) => {
    const res = await fetch(`/api/admin/messages/${id}/read`, { method: "PUT", headers: authHeader() });
    if (res.ok) { setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, readStatus: "Read" } : msg)); showToast("Marked as read."); }
  };

  const handleMarkReplied = async (id: string, current: "Pending" | "Replied") => {
    const next = current === "Pending" ? "Replied" : "Pending";
    const res = await fetch(`/api/admin/messages/${id}/reply`, {
      method: "PUT",
      headers: authHeader({ "Content-Type": "application/json" }),
      body: JSON.stringify({ replyStatus: next }),
    });
    if (res.ok) { setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, replyStatus: next } : msg)); showToast("Reply status updated."); }
  };

  const handleDeleteMessage = (id: string) => {
    setConfirmModal({
      title: "Delete Message",
      description: "Are you sure you want to permanently delete this message?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE", headers: authHeader() });
        if (res.ok) { setMessages((m) => m.filter((msg) => msg.id !== id)); showToast("Message deleted."); }
      },
    });
  };

  const handleClearAnalytics = () => {
    setConfirmModal({
      title: "Clear Analytics Data",
      description: "Are you sure you want to delete all visitor metrics and traffic logs from Firestore? This action is irreversible.",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/analytics/clear", { method: "DELETE", headers: authHeader() });
          if (res.ok) {
            showToast("Traffic logs cleared!");
            fetchAnalytics();
          } else {
            showToast("Failed to clear logs.", "error");
          }
        } catch {
          showToast("Network error.", "error");
        }
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Auth Screen
  // ─────────────────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 px-6 font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-xl shadow-lg shadow-blue-500/20 mb-4">
              ⚡
            </div>
            <h1 className="text-xl font-sans font-bold text-zinc-100">CMS Admin Portal</h1>
            <p className="text-zinc-500 text-xs mt-2 font-sans">Enter your master credentials to unlock the dashboard.</p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <FormField label="Master Password">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLS + " py-3 text-sm"}
                  autoFocus
                  required
                />
              </FormField>

              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400 font-mono">{authError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-sans font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20 mt-2"
              >
                Authenticate →
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-800">
              <button
                onClick={onClose}
                className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Website
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Full Dashboard
  // ─────────────────────────────────────────────────────────────────────────

  const unreadCount = messages.filter((m) => m.readStatus === "Unread").length;

  const NAV_SECTIONS = [
    {
      label: "MONITORING",
      items: [
        { id: "analytics" as TabId, icon: BarChart3, label: "Traffic & Analytics" },
        { id: "messages" as TabId, icon: Inbox, label: "Message Inbox", badge: unreadCount },
      ],
    },
    {
      label: "PORTFOLIO CMS",
      items: [
        { id: "projects" as TabId, icon: FileText, label: "Projects" },
        { id: "blogs" as TabId, icon: FileText, label: "Blog Posts" },
        { id: "skills-exp" as TabId, icon: Code2, label: "Skills & Timeline" },
        { id: "cert-test" as TabId, icon: Award, label: "Certs & Testimonials" },
      ],
    },
    {
      label: "CONFIGURATION",
      items: [
        { id: "profile-settings" as TabId, icon: Settings, label: "Profile & Settings" },
      ],
    },
  ];

  return (
    <div id="admin-cms-dashboard" className="fixed inset-0 z-50 bg-zinc-950 text-zinc-300 flex flex-col font-sans overflow-hidden">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono shadow-xl ${
              toast.type === "success"
                ? "bg-zinc-900 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-900 border-red-500/30 text-red-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmDialog modal={confirmModal} onCancel={() => setConfirmModal(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-sm">⚡</div>
          <div>
            <h1 className="text-sm font-sans font-bold text-zinc-100 leading-none">
              Roihan Workspace <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">ADMIN</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchAnalytics(); fetchMessages(); refetchPortfolio(); showToast("Data refreshed."); }}
            title="Refresh all data"
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-100 transition-colors cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Exit CMS
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Sidebar */}
        <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-zinc-800/60 bg-zinc-900/30 px-3 py-3 md:py-4 shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto scrollbar-none md:scrollbar-thin">
          <nav className="flex md:flex-col gap-6 md:gap-0 md:space-y-5 min-w-max md:min-w-0">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="flex md:block items-center md:items-stretch gap-2 md:gap-0">
                <p className="hidden md:block text-[9px] font-mono font-semibold text-zinc-600 px-2 pb-1.5 uppercase tracking-widest">{section.label}</p>
                <div className="flex md:block gap-2 md:gap-0 md:space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-auto md:w-full px-3 py-2 rounded-xl text-xs font-sans font-medium flex items-center justify-between transition-all cursor-pointer whitespace-nowrap md:whitespace-normal gap-2 ${
                          isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </span>
                        {"badge" in item && item.badge! > 0 && (
                          <span className="h-4 min-w-4 px-1 rounded-full bg-red-500 text-[9px] text-white font-mono flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>


        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden min-w-0">

          {/* ─── TAB: Analytics ──────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                  <h2 className="text-lg font-sans font-bold text-zinc-100">Portfolio Engagement Insights</h2>
                    <button
                      onClick={handleClearAnalytics}
                      className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-mono border border-red-500/20 transition-all cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Real-time data on how users interact with your portfolio.</p>
                </div>
                <div className="flex gap-3 text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <span>SYSTEM: <span className="text-emerald-400">ONLINE</span></span>
                  <span className="text-zinc-700">|</span>
                  <span>INTERACTIONS: <span className="text-blue-400">{analytics?.totalPageViews ?? 0}</span></span>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Profile Views", value: analytics?.totalVisitors ?? 0, icon: Globe, color: "text-blue-400", note: "Distinct visitors" },
                  { label: "Total Interactions", value: analytics?.totalPageViews ?? 0, icon: MousePointerClick, color: "text-cyan-400", note: "Clicks & section views" },
                  { label: "Lead Messages", value: messages.length, icon: Mail, color: "text-purple-400", note: `${unreadCount} unread` },
                ].map((card) => (
                  <div key={card.label} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="flex justify-between items-center text-zinc-500 text-xs font-mono mb-2">
                      <span className="uppercase tracking-wider">{card.label}</span>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <h3 className="text-3xl font-sans font-extrabold text-zinc-100">{card.value}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-2">{card.note}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4">
                    Engagement Volume <span className="text-[10px] font-mono text-zinc-500">(Interactions by Day)</span>
                  </h3>
                  <TrafficChart visitorsByDay={analytics?.visitorsByDay ?? {}} />
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4">Most Engaging Content</h3>
                  <div className="space-y-3">
                    {analytics?.pageViewsByPage
                      ? Object.entries(analytics.pageViewsByPage)
                          // Filter out system files from displaying in the analytics UI entirely
                          .filter(([page]) => !page.includes("/src/") && !page.includes("/node_modules/") && !page.match(/\.(ts|tsx|jsx|json|css|js)$/))
                          .sort(([, a], [, b]) => Number(b) - Number(a))
                          .slice(0, 6)
                          .map(([page, count]) => (
                            <div key={page}>
                              <div className="flex justify-between items-center text-xs font-mono mb-1">
                                <span className="text-zinc-400 truncate">{formatPagePath(page)}</span>
                                <span className="text-zinc-200 ml-2">{count} views</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${Math.min(100, (Number(count) / (analytics.totalPageViews || 1)) * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))
                      : <p className="text-xs text-zinc-600 font-mono">No page data yet.</p>}
                  </div>
                </div>
              </div>

              {/* Country breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4">Visitor Demographics</h3>
                  <div className="space-y-2">
                    {analytics?.visitorsByCountry
                      ? Object.entries(analytics.visitorsByCountry)
                          .sort(([, a], [, b]) => Number(b) - Number(a))
                          .slice(0, 6)
                          .map(([country, count]) => (
                            <div key={country} className="flex justify-between items-center text-xs font-mono">
                              <span className="text-zinc-300 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                {country}
                              </span>
                              <span className="text-zinc-500">{count}</span>
                            </div>
                          ))
                      : <p className="text-xs text-zinc-600 font-mono">No country data yet.</p>}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 mb-4">Live Audience Activity</h3>
                  <div className="space-y-2">
                    {analytics?.recentViews
                      ?.filter((view) => !view.page.includes("/src/") && !view.page.includes("/node_modules/") && !view.page.match(/\.(ts|tsx|jsx|json|css|js)$/))
                      .slice(0, 6)
                      .map((view, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-400 truncate">{formatPagePath(view.page)}</span>
                          <span className="text-zinc-600 ml-2 shrink-0">{new Date(view.timestamp).toLocaleTimeString()}</span>
                        </div>
                      )) ?? <p className="text-xs text-zinc-600 font-mono">No activity yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: Messages ────────────────────────────────────────────── */}
          {activeTab === "messages" && (
            <div className="space-y-5 max-w-4xl">
              <div>
                <h2 className="text-lg font-sans font-bold text-zinc-100">Message Inbox ({messages.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Review and manage contact form submissions.</p>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 font-sans text-xs">
                  No messages yet. When visitors submit the contact form, they appear here.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        msg.readStatus === "Unread" ? "bg-blue-600/5 border-blue-500/20" : "bg-zinc-900 border-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {msg.readStatus === "Unread" && <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />}
                            <h3 className="font-sans font-semibold text-sm text-zinc-100">{msg.name}</h3>
                            <span className="text-zinc-600 text-xs font-mono">·</span>
                            <a href={`mailto:${msg.email}`} className="text-xs font-mono text-zinc-400 hover:text-blue-400 transition-colors">{msg.email}</a>
                          </div>
                          <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{new Date(msg.date).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {msg.readStatus === "Unread" && (
                            <button onClick={() => handleMarkRead(msg.id)} className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-500">
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleMarkReplied(msg.id, msg.replyStatus)}
                            className={`px-2.5 py-1 text-[10px] font-mono rounded-lg cursor-pointer ${
                              msg.replyStatus === "Replied"
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {msg.replyStatus === "Replied" ? "✓ Replied" : "Mark Replied"}
                          </button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Subject: {msg.subject}</p>
                        <p className="text-xs font-sans text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: Projects ───────────────────────────────────────────── */}
          {activeTab === "projects" && (
            <div className="space-y-5 max-w-6xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-sans font-bold text-zinc-100">Projects ({projects.length})</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Manage project entries shown on the portfolio.</p>
                </div>
                <button
                  onClick={() => setEditingItem({ type: "projects", data: { title: "", category: "Backend Architecture", thumbnail: "", description: "", techStack: [], features: [], githubUrl: "#", liveUrl: "#", status: "Completed", featured: false, tags: [] } })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4">
                    <img src={proj.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120"} alt={proj.title} className="h-20 w-24 rounded-xl object-cover shrink-0 bg-zinc-950 border border-zinc-800" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-sans font-bold text-sm text-zinc-100 truncate">{proj.title}</h3>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditingItem({ type: "projects", data: proj })} className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => handleDeleteCRUD("projects", proj.id, proj.title)} className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"><Trash className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{proj.category}</span>
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.techStack.slice(0, 4).map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-500">{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB: Blogs ──────────────────────────────────────────────── */}
          {activeTab === "blogs" && (
            <div className="space-y-5 max-w-5xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-sans font-bold text-zinc-100">Blog Posts ({blogs.length})</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Publish engineering insights and technical deep dives.</p>
                </div>
                <button
                  onClick={() => setEditingItem({ type: "blogs", data: { title: "", content: "", category: "System Design", author: "Roihan", featuredImage: "", tags: [], status: "Published" } })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> New Post
                </button>
              </div>

              <div className="space-y-3">
                {blogs.map((blog) => (
                  <div key={blog.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${blog.status === "Published" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <h3 className="font-sans font-bold text-sm text-zinc-100 truncate">{blog.title}</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">{blog.publishDate} · {blog.readingTime} · {blog.category}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingItem({ type: "blogs", data: blog })} className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"><Pencil className="h-3 w-3" /> Edit</button>
                      <button onClick={() => handleDeleteCRUD("blogs", blog.id, blog.title)} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><Trash className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB: Skills & Experience ─────────────────────────────────── */}
          {activeTab === "skills-exp" && (
            <div className="space-y-10 max-w-5xl">
              {/* Skills */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Tech Skills ({skills.length})</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage skill categories and proficiency levels.</p>
                  </div>
                  <button onClick={() => setEditingItem({ type: "skills", data: { category: "Backend", name: "", percentage: 80, icon: "code", order: 1, visibility: true } })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add Skill
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-zinc-100">{skill.name}</span>
                          <span className="text-[10px] font-mono text-zinc-600">({skill.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 flex-1 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${skill.percentage}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">{skill.percentage}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setEditingItem({ type: "skills", data: skill })} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteCRUD("skills", skill.id, skill.name)} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"><Trash className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experiences */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Career Timeline ({experiences.length})</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage job positions, companies, and durations.</p>
                  </div>
                  <button onClick={() => setEditingItem({ type: "experiences", data: { position: "", company: "", duration: "", description: "", technology: [], logo: "" } })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add Job
                  </button>
                </div>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-bold text-sm text-zinc-100">{exp.position}</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{exp.company} · {exp.duration}</p>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">{exp.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.technology.map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-500">{t}</span>)}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setEditingItem({ type: "experiences", data: exp })} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteCRUD("experiences", exp.id, exp.position)} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"><Trash className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: Certs & Testimonials ────────────────────────────────── */}
          {activeTab === "cert-test" && (
            <div className="space-y-10 max-w-5xl">
              {/* Certificates */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Certifications ({certificates.length})</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage professional badges and credentials.</p>
                  </div>
                  <button onClick={() => setEditingItem({ type: "certificates", data: { name: "", certificateImage: "", issuer: "", date: "", credentialUrl: "#" } })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add Certificate
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-sans font-bold text-xs text-zinc-100">{cert.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{cert.issuer} · {cert.date}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingItem({ type: "certificates", data: cert })} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteCRUD("certificates", cert.id, cert.name)} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"><Trash className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-sans font-bold text-zinc-100">Testimonials ({testimonials.length})</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage client references and star ratings.</p>
                  </div>
                  <button onClick={() => setEditingItem({ type: "testimonials", data: { name: "", position: "", company: "", comment: "", rating: 5, avatar: "" } })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add Testimonial
                  </button>
                </div>
                <div className="space-y-3">
                  {testimonials.map((test) => (
                    <div key={test.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-sm text-zinc-100">{test.name}</h4>
                          <span className="text-zinc-600 text-xs">·</span>
                          <span className="text-xs text-zinc-500">{test.position} at {test.company}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 italic line-clamp-2">"{test.comment}"</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setEditingItem({ type: "testimonials", data: test })} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteCRUD("testimonials", test.id, test.name)} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"><Trash className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: Profile & Settings ──────────────────────────────────── */}
          {activeTab === "profile-settings" && (
            <div className="space-y-6 max-w-3xl">

              {/* Profile Bio */}
              {profile && (
                <form onSubmit={updateProfile} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-800">
                    <Settings className="h-4 w-4 text-zinc-400" /> Biography & Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Headline Title">
                      <input type="text" value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} className={INPUT_CLS} required />
                    </FormField>
                    <FormField label="Subtitle Specialty">
                      <input type="text" value={profile.subtitle} onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })} className={INPUT_CLS} required />
                    </FormField>
                  </div>
                  <FormField label="Brief Description">
                    <input type="text" value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} className={INPUT_CLS} required />
                  </FormField>
                  <FormField label="Full Biography">
                    <textarea value={profile.biography} onChange={(e) => setProfile({ ...profile, biography: e.target.value })} rows={4} className={INPUT_CLS + " font-sans leading-relaxed"} required />
                  </FormField>
                  <FormField label="Education">
                    <input type="text" value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} className={INPUT_CLS} />
                  </FormField>
                  <FormField label="Profile Photo">
                    <ImageUploadButton currentUrl={profile.profileImage} onUploaded={(url) => setProfile({ ...profile, profileImage: url })} token={adminToken} />
                  </FormField>
                  <FormField label="Resume URL">
                    <input type="text" value={profile.resumeUrl} onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })} className={INPUT_CLS} placeholder="https://..." />
                  </FormField>

                  <h3 className="text-sm font-sans font-semibold text-zinc-100 pt-4 pb-2 border-b border-zinc-800">Quick Stats (Numbers)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <FormField label="Years Experience">
                      <input type="number" value={profile.stats?.yearsExp || 0} onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, yearsExp: Number(e.target.value) }})} className={INPUT_CLS} />
                    </FormField>
                    <FormField label="Projects Done">
                      <input type="number" value={profile.stats?.projectsCount || 0} onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, projectsCount: Number(e.target.value) }})} className={INPUT_CLS} />
                    </FormField>
                    <FormField label="GitHub Repos">
                      <input type="number" value={profile.stats?.reposCount || 0} onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, reposCount: Number(e.target.value) }})} className={INPUT_CLS} />
                    </FormField>
                    <FormField label="Core Techs">
                      <input type="number" value={profile.stats?.techCount || 0} onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, techCount: Number(e.target.value) }})} className={INPUT_CLS} />
                    </FormField>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-semibold transition-colors cursor-pointer disabled:opacity-60">
                      {loading ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              )}

              {/* Social Links — all 5 fields */}
              {socials && (
                <form onSubmit={updateSocials} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 pb-2 border-b border-zinc-800">Social Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="GitHub URL"><input type="text" value={socials.github} onChange={(e) => setSocials({ ...socials, github: e.target.value })} className={INPUT_CLS} /></FormField>
                    <FormField label="LinkedIn URL"><input type="text" value={socials.linkedin} onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })} className={INPUT_CLS} /></FormField>
                    <FormField label="Instagram URL"><input type="text" value={socials.instagram} onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} className={INPUT_CLS} /></FormField>
                    <FormField label="Email Address"><input type="email" value={socials.email} onChange={(e) => setSocials({ ...socials, email: e.target.value })} className={INPUT_CLS} /></FormField>
                    <FormField label="WhatsApp URL"><input type="text" value={socials.whatsapp} onChange={(e) => setSocials({ ...socials, whatsapp: e.target.value })} className={INPUT_CLS} /></FormField>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-semibold cursor-pointer">Save Social Links</button>
                  </div>
                </form>
              )}

              {/* Site Settings */}
              {settings && (
                <form onSubmit={updateSettings} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-sans font-semibold text-zinc-100 pb-2 border-b border-zinc-800">Site Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Site Name"><input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className={INPUT_CLS} /></FormField>
                    <FormField label="Site Logo (Letter/Emoji)"><input type="text" value={settings.siteLogo} onChange={(e) => setSettings({ ...settings, siteLogo: e.target.value })} className={INPUT_CLS} maxLength={4} /></FormField>
                    <FormField label="Footer Text"><input type="text" value={settings.footerText} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className={INPUT_CLS} /></FormField>
                    <FormField label="Pinned GitHub Repos (comma separated)"><input type="text" value={settings.githubPinnedRepos || ""} onChange={(e) => setSettings({ ...settings, githubPinnedRepos: e.target.value })} className={INPUT_CLS} placeholder="repo-name, another-repo" /></FormField>
                    <FormField label="Theme">
                      <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className={INPUT_CLS}>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </FormField>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-semibold cursor-pointer">Save Settings</button>
                  </div>
                </form>
              )}

              {/* Password */}
              <form onSubmit={updatePassword} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-sans font-semibold text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <Key className="h-4 w-4 text-zinc-400" /> Rotate Admin Password
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Current Password"><input type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className={INPUT_CLS} required /></FormField>
                  <FormField label="New Password"><input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className={INPUT_CLS} required /></FormField>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-semibold cursor-pointer">Commit Rotation</button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ─── CRUD Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-sans font-bold text-zinc-100">
                  {editingItem.data.id ? "Edit" : "New"} {editingItem.type.replace(/s$/, "").replace(/^\w/, (c) => c.toUpperCase())}
                </h3>
                <button onClick={() => setEditingItem(null)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">

                {/* Projects */}
                {editingItem.type === "projects" && (
                  <>
                    <FormField label="Project Title"><input type="text" value={editingItem.data.title} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })} className={INPUT_CLS} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Category"><input type="text" value={editingItem.data.category} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Status">
                        <select value={editingItem.data.status} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })} className={INPUT_CLS}>
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Thumbnail Image">
                      <ImageUploadButton currentUrl={editingItem.data.thumbnail} onUploaded={(url) => setEditingItem({ ...editingItem, data: { ...editingItem.data, thumbnail: url } })} token={adminToken} />
                    </FormField>
                    <FormField label="Description"><textarea value={editingItem.data.description} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })} rows={3} className={INPUT_CLS} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Tech Stack (comma separated)"><input type="text" value={editingItem.data.techStackRaw !== undefined ? editingItem.data.techStackRaw : (Array.isArray(editingItem.data.techStack) ? editingItem.data.techStack.join(", ") : "")} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, techStackRaw: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Tags (comma separated)"><input type="text" value={editingItem.data.tagsRaw !== undefined ? editingItem.data.tagsRaw : (Array.isArray(editingItem.data.tags) ? editingItem.data.tags.join(", ") : "")} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, tagsRaw: e.target.value } })} className={INPUT_CLS} /></FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="GitHub URL"><input type="text" value={editingItem.data.githubUrl} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, githubUrl: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Live Demo URL"><input type="text" value={editingItem.data.liveUrl} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, liveUrl: e.target.value } })} className={INPUT_CLS} /></FormField>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingItem.data.featured} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, featured: e.target.checked } })} className="rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-0" />
                      <span className={LABEL_CLS + " mb-0"}>Featured on homepage</span>
                    </label>
                  </>
                )}

                {/* Blogs */}
                {editingItem.type === "blogs" && (
                  <>
                    <FormField label="Blog Title"><input type="text" value={editingItem.data.title} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })} className={INPUT_CLS} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Category"><input type="text" value={editingItem.data.category} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Status">
                        <select value={editingItem.data.status} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })} className={INPUT_CLS}>
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Cover Image">
                      <ImageUploadButton currentUrl={editingItem.data.featuredImage} onUploaded={(url) => setEditingItem({ ...editingItem, data: { ...editingItem.data, featuredImage: url } })} token={adminToken} />
                    </FormField>
                    <FormField label="Author"><input type="text" value={editingItem.data.author} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, author: e.target.value } })} className={INPUT_CLS} /></FormField>
                    <FormField label="Content (Markdown supported)"><textarea value={editingItem.data.content} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })} rows={10} className={INPUT_CLS + " font-mono leading-relaxed"} /></FormField>
                  </>
                )}

                {/* Skills */}
                {editingItem.type === "skills" && (
                  <>
                    <FormField label="Skill Name"><input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })} className={INPUT_CLS} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Category">
                        <select value={editingItem.data.category} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} className={INPUT_CLS}>
                          <option value="Backend">Backend</option>
                          <option value="Frontend">Frontend</option>
                          <option value="Database">Database</option>
                          <option value="DevOps">DevOps</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormField>
                      <FormField label="Proficiency (0–100)">
                        <input type="number" min="0" max="100" value={editingItem.data.percentage} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, percentage: Number(e.target.value) } })} className={INPUT_CLS} />
                      </FormField>
                    </div>
                  </>
                )}

                {/* Experiences */}
                {editingItem.type === "experiences" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Position Title"><input type="text" value={editingItem.data.position} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, position: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Company Name"><input type="text" value={editingItem.data.company} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, company: e.target.value } })} className={INPUT_CLS} /></FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Duration (e.g. 2023 – Present)"><input type="text" value={editingItem.data.duration} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, duration: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Tech Used (comma separated)"><input type="text" value={editingItem.data.technologyRaw !== undefined ? editingItem.data.technologyRaw : (Array.isArray(editingItem.data.technology) ? editingItem.data.technology.join(", ") : "")} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, technologyRaw: e.target.value } })} className={INPUT_CLS} /></FormField>
                    </div>
                    <FormField label="Description"><textarea value={editingItem.data.description} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })} rows={3} className={INPUT_CLS} /></FormField>
                  </>
                )}

                {/* Certificates */}
                {editingItem.type === "certificates" && (
                  <>
                    <FormField label="Certificate Name"><input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })} className={INPUT_CLS} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Issuer"><input type="text" value={editingItem.data.issuer} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, issuer: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Date Received"><input type="text" value={editingItem.data.date} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })} className={INPUT_CLS} placeholder="Jan 2024" /></FormField>
                    </div>
                    <FormField label="Credential URL"><input type="text" value={editingItem.data.credentialUrl} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, credentialUrl: e.target.value } })} className={INPUT_CLS} /></FormField>
                  </>
                )}

                {/* Testimonials */}
                {editingItem.type === "testimonials" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Client Name"><input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })} className={INPUT_CLS} /></FormField>
                      <FormField label="Company"><input type="text" value={editingItem.data.company} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, company: e.target.value } })} className={INPUT_CLS} /></FormField>
                    </div>
                    <FormField label="Position / Title"><input type="text" value={editingItem.data.position} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, position: e.target.value } })} className={INPUT_CLS} /></FormField>
                    <FormField label="Testimonial Comment"><textarea value={editingItem.data.comment} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, comment: e.target.value } })} rows={3} className={INPUT_CLS} /></FormField>
                    <FormField label="Avatar Photo">
                      <ImageUploadButton currentUrl={editingItem.data.avatar || ""} onUploaded={(url) => setEditingItem({ ...editingItem, data: { ...editingItem.data, avatar: url } })} token={adminToken} />
                    </FormField>
                    <FormField label="Star Rating (1–5)"><input type="number" min="1" max="5" value={editingItem.data.rating} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, rating: Number(e.target.value) } })} className={INPUT_CLS} /></FormField>
                  </>
                )}

              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs font-mono cursor-pointer transition-colors">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingCRUD}
                  onClick={() => handleSaveCRUD(editingItem.type, editingItem.data, editingItem.data.id)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-semibold cursor-pointer transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {savingCRUD ? (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="h-3.5 w-3.5" /> Commit Changes</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
