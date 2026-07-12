import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, ExternalLink, Github, Linkedin, Mail, BookOpen, Award, FileText, Send, 
  Moon, Sun, Briefcase, Code2, Database, Cpu, Globe, Calendar, ArrowUp, Menu, X, 
  Search, MessageSquare, Settings, Flame, ChevronRight, CheckCircle, Share2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Sub-components
import AiAssistant from "./components/AiAssistant";
import BackendArchitecture from "./components/BackendArchitecture";
import GitHubSection from "./components/GitHubSection";
import Dashboard from "./components/Dashboard";

// Shared Types
import { 
  Profile, Skill, Experience, Project, Certificate, Blog, 
  Testimonial, Message, SocialLink, Setting 
} from "./types";

export default function App() {
  // Global App States
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter & Search States
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProjectCategory, setSelectedProjectCategory] = useState("All");
  const [activeDetailProject, setActiveDetailProject] = useState<Project | null>(null);

  const [blogSearch, setBlogSearch] = useState("");
  const [selectedBlogCategory, setSelectedBlogCategory] = useState("All");
  const [activeReadBlog, setActiveReadBlog] = useState<Blog | null>(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubbed, setNewsletterSubbed] = useState(false);

  // Back To Top Visibility
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Typing animation lists
  const typingTitles = ["Software Engineer", "Backend Engineer", "Web Developer"];
  const [titleIdx, setTitleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typedText, setTypedText] = useState("");

  // Terminal mock lines state
  const terminalLogs = [
    "$ go run main.go",
    "Initializing Roihan's Environment...",
    "DB Connection: PostgreSQL on Port 5432 - OK",
    "Redis Cache Server: Port 6379 - OK",
    "Service Gateway Listening on HTTP/gRPC Port 3000...",
    "Gemini Model Agent: gemini-3.5-flash - READY"
  ];
  const [activeLogIdx, setActiveLogIdx] = useState(0);

  // Fetch all portfolio data on mount
  const fetchPortfolioData = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      } else {
        console.error("API returned status:", res.status);
        setApiError(`Server error (${res.status}). Please check Vercel Logs.`);
      }
    } catch (err) {
      console.error("Failed to sync portfolio database:", err);
      setApiError("Network error. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();

    // Scroll top monitor
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check URL params to auto-open specific blog
  useEffect(() => {
    if (portfolio?.blogs) {
      const params = new URLSearchParams(window.location.search);
      const blogSlug = params.get("blog");
      if (blogSlug) {
        const foundBlog = portfolio.blogs.find((b: Blog) => b.slug === blogSlug);
        if (foundBlog) {
          setActiveReadBlog(foundBlog);
        }
      }
    }
  }, [portfolio]);

  // Animated Typing logic
  useEffect(() => {
    const handleTyping = () => {
      const currentWord = typingTitles[titleIdx];
      if (!isDeleting) {
        setTypedText(currentWord.slice(0, charIdx + 1));
        setCharIdx(prev => prev + 1);

        if (charIdx + 1 === currentWord.length) {
          // Pause at completed word
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setTypedText(currentWord.slice(0, charIdx - 1));
        setCharIdx(prev => prev - 1);

        if (charIdx - 1 === 0) {
          setIsDeleting(false);
          setTitleIdx(prev => (prev + 1) % typingTitles.length);
        }
      }
    };

    const speed = isDeleting ? 40 : 80;
    const t = setTimeout(handleTyping, speed);
    return () => clearTimeout(t);
  }, [charIdx, isDeleting, titleIdx]);

  // Terminal log sequencing
  useEffect(() => {
    if (activeLogIdx < terminalLogs.length - 1) {
      const t = setTimeout(() => {
        setActiveLogIdx(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [activeLogIdx]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactFeedback(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (res.ok) {
        setContactFeedback({ type: "success", text: "✓ Thank you! Your message has been stored in the CMS inbox." });
        setContactForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setContactFeedback({ type: "error", text: data.error || "Submission failed." });
      }
    } catch (err) {
      setContactFeedback({ type: "error", text: "Network timeout. Try again." });
    } finally {
      setContactLoading(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubbed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubbed(false), 5000);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Custom Markdown parser for dynamic blog rendering
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-sans font-semibold text-zinc-100 mt-5 mb-2.5">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-sans font-bold text-zinc-100 mt-6 mb-3.5 border-b border-zinc-800 pb-1.5">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="text-xs font-sans text-zinc-300 ml-4 list-disc mt-1.5">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("1. ")) {
        return <li key={idx} className="text-xs font-sans text-zinc-300 ml-4 list-decimal mt-1.5">{line.replace("1. ", "")}</li>;
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-3" />;
      }
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={idx} className="text-xs font-sans text-zinc-400 leading-relaxed mt-2">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part)}
          </p>
        );
      }
      return <p key={idx} className="text-xs font-sans text-zinc-400 leading-relaxed mt-2">{line}</p>;
    });
  };

  if (apiError && !portfolio) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans px-6">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 mx-auto">!</div>
          <p className="text-red-400 text-sm">{apiError}</p>
          <p className="text-zinc-500 text-xs">If you are on Vercel, check the Serverless Function logs (Functions tab).</p>
        </div>
      </div>
    );
  }

  if (loading || !portfolio) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-mono text-zinc-500">Syncing Portfolio database nodes...</p>
        </div>
      </div>
    );
  }

  const { profile, skills, experiences, projects, certificates, blogs, testimonials, socials, settings } = portfolio;

  // Extract unique project & blog categories for tabs
  const projectCategories = ["All", ...Array.from(new Set(projects.map((p: any) => p.category)))];
  const blogCategories = ["All", ...Array.from(new Set(blogs.map((b: any) => b.category)))];

  // Filter listings
  const filteredProjects = projects.filter((p: any) => {
    const matchesCategory = selectedProjectCategory === "All" || p.category === selectedProjectCategory;
    const matchesSearch = p.title.toLowerCase().includes(projectSearch.toLowerCase()) || p.description.toLowerCase().includes(projectSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredBlogs = blogs.filter((b: any) => {
    const matchesCategory = selectedBlogCategory === "All" || b.category === selectedBlogCategory;
    const matchesSearch = b.title.toLowerCase().includes(blogSearch.toLowerCase()) || b.content.toLowerCase().includes(blogSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen ${isLightMode ? "bg-zinc-50 text-zinc-900 light-theme" : "grid-bg text-[#FAFAFA]"} font-sans transition-colors duration-200 relative`}>
      
      {/* Dynamic Background glow lines */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none z-0"></div>
      {!isLightMode && (
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      )}

      {/* TOP NAVIGATION BAR */}
      <nav className={`sticky top-0 z-40 w-full px-6 h-16 flex items-center justify-between transition-all duration-300 ${isLightMode ? "bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200" : "glass bg-[#18181B]/70"} ${isScrolled ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold font-sans">
            {settings?.siteLogo || "R"}
          </div>
          <span className="font-display font-bold text-sm text-zinc-100 hidden sm:inline-block">
            {settings?.siteName || "Roihan Portfolio"}
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium text-zinc-400">
          <button onClick={() => scrollToSection("about")} className="hover:text-zinc-100 transition-colors cursor-pointer">01. About</button>
          <button onClick={() => scrollToSection("skills")} className="hover:text-zinc-100 transition-colors cursor-pointer">02. Skills</button>
          <button onClick={() => scrollToSection("experience")} className="hover:text-zinc-100 transition-colors cursor-pointer">03. Exp</button>
          <button onClick={() => scrollToSection("projects")} className="hover:text-zinc-100 transition-colors cursor-pointer">04. Projects</button>
          <button onClick={() => scrollToSection("architecture")} className="hover:text-zinc-100 transition-colors cursor-pointer">05. Arch</button>
          <button onClick={() => scrollToSection("certifications")} className="hover:text-zinc-100 transition-colors cursor-pointer">06. Certs</button>
          <button onClick={() => scrollToSection("blog")} className="hover:text-zinc-100 transition-colors cursor-pointer">07. Blog</button>
          <button onClick={() => scrollToSection("contact")} className="hover:text-zinc-100 transition-colors cursor-pointer">08. Contact</button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCmsOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-mono transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            CMS Panel
          </button>
          <a
            href={socials?.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hidden md:inline-block"
          >
            <Github className="h-4 w-4" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 inset-x-0 z-30 bg-zinc-950 border-b border-zinc-900 p-6 flex flex-col gap-4 text-sm font-mono text-zinc-400 shadow-2xl"
          >
            <button onClick={() => scrollToSection("about")} className="text-left py-1">01. About</button>
            <button onClick={() => scrollToSection("skills")} className="text-left py-1">02. Skills</button>
            <button onClick={() => scrollToSection("experience")} className="text-left py-1">03. Exp</button>
            <button onClick={() => scrollToSection("projects")} className="text-left py-1">04. Projects</button>
            <button onClick={() => scrollToSection("architecture")} className="text-left py-1">05. Arch</button>
            <button onClick={() => scrollToSection("certifications")} className="text-left py-1">06. Certs</button>
            <button onClick={() => scrollToSection("blog")} className="text-left py-1">07. Blog</button>
            <button onClick={() => scrollToSection("contact")} className="text-left py-1">08. Contact</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center py-16 px-6 relative z-10 overflow-hidden">
        {/* Glow Orb */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs font-mono font-medium"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Open to relocation & remote contracts
            </motion.div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{profile?.name || "Roihan Arrafli"}</span><br />
              <span className="text-2xl sm:text-4xl text-zinc-300 mt-2 block">
                I build resilient <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500">{typedText}</span><span className="animate-pulse text-blue-500 ml-1">|</span>
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base font-sans max-w-lg leading-relaxed">
              {profile?.description || "Architecting robust backend pipelines, high-throughput microservices, and elegant web solutions."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => scrollToSection("projects")}
                className={`px-6 py-3 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer shadow-lg ${
                  isLightMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10" 
                    : "bg-white text-black hover:bg-zinc-200 shadow-white/5"
                }`}
              >
                Inspect Projects
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`px-6 py-3 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
                  isLightMode 
                    ? "bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200" 
                    : "glass text-white hover:bg-white/5"
                }`}
              >
                Contact Me
              </button>
            </div>
          </div>

          {/* Right Terminal Animation */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-20 blur-xl"></div>
            
            <div className={`relative rounded-2xl shadow-2xl p-6 font-mono text-[11px] sm:text-xs overflow-hidden h-72 flex flex-col justify-between ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-800" : "glass bg-[#18181B]/70 glow-accent"}`}>
              
              {/* Toolbar */}
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/40"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/40"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/40"></div>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono select-none">root@roihan-system ~ bash</span>
              </div>

              {/* Console logs */}
              <div className="flex-1 space-y-2 mt-4 text-left">
                {terminalLogs.slice(0, activeLogIdx + 1).map((log, idx) => (
                  <p 
                    key={idx} 
                    className={`${idx === 0 ? "text-zinc-400" : log.includes("OK") || log.includes("READY") ? "text-emerald-400" : "text-zinc-500"}`}
                  >
                    {log}
                  </p>
                ))}
              </div>

              <div className="text-zinc-700 text-[10px] border-t border-zinc-900 pt-3 flex justify-between">
                <span>Active Connection: SECURE</span>
                <span>UTC Time: {new Date().toISOString().split("T")[1].slice(0, 5)}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT SECTION & STATISTICS */}
      <section id="about" className="py-24 border-t border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Bio */}
            <div className="space-y-6">
              <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">
                01. BIOGRAPHY
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight">
                Software Craftsmanship & Engineering Philosophy
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
                {profile?.biography}
              </p>
              
              <div className={`p-4 rounded-xl text-xs font-mono transition-colors duration-200 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-600" : "glass text-zinc-400"}`}>
                🎓 {profile?.education || "B.S. Computer Science"}
              </div>
            </div>

            {/* Statistics Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-2xl flex flex-col justify-between h-36 transition-colors duration-200 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass"}`}>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Featured Projects</span>
                <h3 className={`text-3xl sm:text-4xl font-display font-extrabold mt-2 ${isLightMode ? "text-zinc-900" : "text-white"}`}>{profile?.stats.projectsCount || 12}</h3>
                <span className="text-[10px] text-blue-400 font-mono mt-1">✓ Complete CRUDs</span>
              </div>
              <div className={`p-6 rounded-2xl flex flex-col justify-between h-36 transition-colors duration-200 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass"}`}>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Years Experience</span>
                <h3 className={`text-3xl sm:text-4xl font-display font-extrabold mt-2 ${isLightMode ? "text-zinc-900" : "text-white"}`}>{profile?.stats.yearsExp || 4}+</h3>
                <span className="text-[10px] text-cyan-400 font-mono mt-1">✓ Pro & Contracts</span>
              </div>
              <div className={`p-6 rounded-2xl flex flex-col justify-between h-36 transition-colors duration-200 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass"}`}>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Repository Nodes</span>
                <h3 className={`text-3xl sm:text-4xl font-display font-extrabold mt-2 ${isLightMode ? "text-zinc-900" : "text-white"}`}>{profile?.stats.reposCount || 45}</h3>
                <span className="text-[10px] text-emerald-400 font-mono mt-1">✓ Git synced</span>
              </div>
              <div className={`p-6 rounded-2xl flex flex-col justify-between h-36 transition-colors duration-200 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass"}`}>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Core Languages</span>
                <h3 className={`text-3xl sm:text-4xl font-display font-extrabold mt-2 ${isLightMode ? "text-zinc-900" : "text-white"}`}>{profile?.stats.techCount || 16}</h3>
                <span className="text-[10px] text-purple-400 font-mono mt-1">✓ Verified tech</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TECH STACK & DETAILED skills list */}
      <section id="skills" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">02. CAPABILITIES</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight mt-3">Categorized Technical Stack</h2>
            <p className="text-zinc-400 text-sm mt-3">A list of language nodes, storage mechanisms, frameworks, and deployment engines I specialize in.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Backend", "Frontend", "Database", "DevOps"].map((cat) => {
              const catSkills = skills.filter((s: Skill) => s.category === cat);
              return (
                <div key={cat} className={`p-6 rounded-2xl transition-all hover:scale-[1.01] ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-800" : "glass"}`}>
                  <h3 className={`text-sm font-mono font-bold border-b pb-3 mb-4 uppercase tracking-wider ${isLightMode ? "text-zinc-800 border-zinc-200" : "text-white border-zinc-800"}`}>{cat} Ecosystem</h3>
                  <div className="space-y-4">
                    {catSkills.map((skill: Skill) => (
                      <div key={skill.id}>
                        <div className={`flex justify-between text-xs font-mono mb-1.5 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                          <span>{skill.name}</span>
                          <span>{skill.percentage}%</span>
                        </div>
                        <div className={`h-1 w-full rounded-full overflow-hidden ${isLightMode ? "bg-zinc-200" : "bg-zinc-950"}`}>
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${skill.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CAREER TIMELINE EXPERIENCES */}
      <section id="experience" className="py-24 bg-zinc-900/10 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">03. ARCHIVE</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight mt-3">Professional Career Timeline</h2>
          </div>

          <div className="relative border-l border-zinc-800 ml-4 space-y-12">
            {experiences.map((exp: Experience, idx: number) => (
              <div key={exp.id} className="relative pl-8">
                {/* Timeline node */}
                <span className="absolute -left-2.5 top-1.5 h-5 w-5 rounded-full bg-zinc-950 border-2 border-blue-500 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                </span>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-widest bg-blue-500/5 border border-blue-500/10 px-2.5 py-0.5 rounded-full">{exp.duration}</span>
                  <h3 className="text-lg font-sans font-bold text-white mt-2">{exp.position}</h3>
                  <h4 className="text-xs font-mono text-zinc-400">{exp.company}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans pt-2">{exp.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {exp.technology.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS WITH FILTERS AND SEARCH */}
      <section id="projects" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">04. SPECIMENS</span>
              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight mt-3">Featured Core Projects</h2>
              <p className="text-zinc-400 text-sm mt-3">A detailed log of system gateway routers, collaborative platforms, and microservices.</p>
            </div>

            {/* Filter and Search box */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search project title..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full sm:w-60 pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
                />
              </div>

              {/* Tabs */}
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 overflow-x-auto">
                {projectCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedProjectCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono cursor-pointer transition-all ${
                      selectedProjectCategory === cat ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((proj: Project) => (
              <motion.div
                key={proj.id}
                whileHover={{ y: -4 }}
                className={`group relative rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"}`}
                onClick={() => setActiveDetailProject(proj)}
              >
                {/* Spotlight glow background inside card */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-colors duration-500 pointer-events-none z-0"></div>
                
                <div className="relative z-10">
                  <img 
                    src={proj.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"} 
                    alt={proj.title}
                    className="h-44 w-full object-cover bg-zinc-950 border-b border-zinc-850"
                  />
                  <div className="p-6 space-y-3">
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isLightMode ? "bg-zinc-200/60 text-zinc-600 border border-zinc-300" : "bg-zinc-950 border border-zinc-850 text-zinc-500"}`}>{proj.category}</span>
                    <h3 className={`text-base font-sans font-bold hover:text-blue-400 transition-colors mt-2 ${isLightMode ? "text-zinc-800" : "text-white"}`}>{proj.title}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 pt-1">{proj.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex justify-between items-center text-xs font-mono text-zinc-500">
                  <div className="flex gap-1">
                    {proj.techStack.slice(0, 3).map((tech, i) => (
                      <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] ${isLightMode ? "bg-zinc-200/50 text-zinc-600 border border-zinc-200" : "bg-zinc-950 border border-zinc-850 text-zinc-500"}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="text-blue-400 flex items-center gap-1 hover:underline">
                    Inspect <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
              No matching specimens found. Try another query or category tab.
            </div>
          )}
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE MAP INFOGRAPHIC */}
      <BackendArchitecture isLightMode={isLightMode} />

      {/* GITHUB INTEGRATION */}
      <GitHubSection githubUrl={portfolio?.socials?.github} pinnedRepos={portfolio?.settings?.githubPinnedRepos} isLightMode={isLightMode} />

      {/* CERTIFICATIONS LIST */}
      <section id="certifications" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">05. CREDENTIALS</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white mt-3">Professional Certifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {certificates.map((cert: Certificate) => (
              <div key={cert.id} className={`p-5 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01] ${isLightMode ? "bg-zinc-100 border border-zinc-200" : "glass"}`}>
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-blue-400 shrink-0 ${isLightMode ? "bg-blue-100/60 border border-blue-200" : "bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-white/5"}`}>
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`text-sm font-sans font-bold leading-snug ${isLightMode ? "text-zinc-800" : "text-white"}`}>{cert.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">{cert.issuer} • {cert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG DIRECTORY */}
      <section id="blog" className="py-24 bg-zinc-900/10 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">06. LOGS</span>
              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white mt-3">Engineering Insights & Blog</h2>
            </div>

            {/* Filter */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  className="w-full sm:w-60 pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog: Blog) => (
              <div 
                key={blog.id} 
                className={`p-6 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.01] cursor-pointer ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass"}`}
                onClick={() => setActiveReadBlog(blog)}
              >
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-4">
                    <span>{blog.publishDate}</span>
                    <span>{blog.readingTime}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono ${isLightMode ? "bg-blue-100/60 border border-blue-200 text-blue-600" : "bg-blue-500/5 border border-blue-500/10 text-blue-400"}`}>{blog.category}</span>
                  <h3 className={`text-base font-sans font-bold mt-4 leading-snug hover:text-blue-400 transition-colors ${isLightMode ? "text-zinc-800" : "text-white"}`}>{blog.title}</h3>
                  <p className="text-zinc-400 text-xs font-sans mt-3 line-clamp-3 leading-relaxed">{blog.content}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-850/60 flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>Author: {blog.author}</span>
                  <span className="text-blue-400 flex items-center gap-1 hover:underline">Read article →</span>
                </div>
              </div>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
              No matching logs found.
            </div>
          )}
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">07. COGNIZANCE</span>
          <h2 className="text-3xl font-sans font-bold text-white mt-3 mb-16">References & Recommendations</h2>

          <div className="space-y-8">
            {testimonials.map((test: Testimonial) => (
              <div key={test.id} className={`p-8 rounded-3xl text-left relative backdrop-blur-sm ${isLightMode ? "bg-zinc-100 border border-zinc-200" : "glass"}`}>
                <p className={`italic text-sm sm:text-base leading-relaxed font-sans ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>
                  "{test.comment}"
                </p>
                
                <div className={`flex items-center gap-3.5 mt-6 border-t pt-6 ${isLightMode ? "border-zinc-200" : "border-zinc-850/60"}`}>
                  <img 
                    src={test.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"} 
                    alt={test.name}
                    className={`h-10 w-10 rounded-full object-cover ${isLightMode ? "bg-zinc-200 border border-zinc-350" : "bg-zinc-950 border border-zinc-800"}`}
                  />
                  <div>
                    <h4 className={`text-xs font-sans font-bold ${isLightMode ? "text-zinc-800" : "text-zinc-100"}`}>{test.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{test.position} • {test.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact" className="py-24 bg-zinc-900/10 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">08. GATEWAY</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white mt-3">Initiate Connection</h2>
            <p className="text-zinc-400 text-sm mt-3">Send an API request message directly to my administrative inbox. I respond within 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Quick social card contacts */}
            <div className="md:col-span-1 space-y-4">
              <div className={`p-6 rounded-2xl space-y-4 ${isLightMode ? "bg-zinc-100 border border-zinc-200" : "glass"}`}>
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightMode ? "text-zinc-800" : "text-white"}`}>Secure Directs</h4>
                <div className="space-y-3 text-xs font-mono text-zinc-400">
                  <a href={`mailto:${socials?.email}`} className="flex items-center gap-2.5 hover:text-zinc-200 transition-colors">
                    <Mail className="h-4 w-4 text-zinc-500" /> {socials?.email}
                  </a>
                  <a href={socials?.linkedin} className="flex items-center gap-2.5 hover:text-zinc-200 transition-colors">
                    <Linkedin className="h-4 w-4 text-zinc-500" /> Linkedin Node
                  </a>
                  <a href={socials?.github} className="flex items-center gap-2.5 hover:text-zinc-200 transition-colors">
                    <Github className="h-4 w-4 text-zinc-500" /> GitHub Profiles
                  </a>
                </div>
              </div>
 
              {/* Newsletter Subscription */}
              <div className={`p-6 rounded-2xl ${isLightMode ? "bg-zinc-100 border border-zinc-200" : "glass"}`}>
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightMode ? "text-zinc-800" : "text-white"}`}>Architect Newsletter</h4>
                <p className="text-[10px] text-zinc-500 font-sans mt-2">Subscribe to receive system designs and backend performance guides.</p>
                
                <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-2">
                  <input
                    type="email"
                    placeholder="architect@tech.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-[11px] rounded-lg focus:outline-none ${isLightMode ? "bg-zinc-200 border border-zinc-300 text-zinc-800" : "bg-zinc-950 border border-zinc-800 text-zinc-300 placeholder:text-zinc-700"}`}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-blue-600 text-white text-[11px] font-sans font-medium hover:bg-blue-500 cursor-pointer"
                  >
                    {newsletterSubbed ? "✓ Subscribed!" : "Subscribe"}
                  </button>
                </form>
              </div>
            </div>
 
            {/* Direct Form */}
            <form onSubmit={handleContactSubmit} className={`md:col-span-2 p-8 rounded-3xl space-y-4 ${isLightMode ? "bg-zinc-100 border border-zinc-200 text-zinc-900" : "glass"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 mb-1.5">NAME NODE</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/80"
                    placeholder="Linus Torvalds"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 mb-1.5">EMAIL ADDR</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/80"
                    placeholder="linus@linux.org"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1.5">SUBJECT LINE</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/80"
                  placeholder="Inquiry about custom high-traffic Go API Gateway"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1.5">MESSAGE CONSOLE</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/80"
                  placeholder="Hey Roihan, we reviewed your Clean Architecture blog..."
                  required
                />
              </div>

              {contactFeedback && (
                <p className={`text-xs font-mono ${contactFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {contactFeedback.text}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  <Send className="h-3.5 w-3.5" /> {contactLoading ? "Broadcasting..." : "Transmit Message"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-12 px-6 ${isLightMode ? "border-zinc-200 bg-zinc-100" : "border-white/5 bg-[#09090B]/50"}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-zinc-950 font-bold text-sm">
              {settings?.siteLogo || "R"}
            </div>
            <span className="text-xs text-zinc-500 font-mono">© {new Date().getFullYear()} {profile?.name || "Roihan Arrafli"}. All rights reserved.</span>
          </div>

          <div className="flex gap-4 text-xs font-mono text-zinc-500">
            <a href={socials?.github} className="hover:text-zinc-300">GitHub</a>
            <a href={socials?.linkedin} className="hover:text-zinc-300">LinkedIn</a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer">
              Top <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </footer>

      {/* GLOBAL FLOATING AI ASSISTANT */}
      <AiAssistant />

      {/* FLOATING NAVIGATION PILL */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: isScrolled ? 0 : 100, opacity: isScrolled ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass px-6 py-3 rounded-full hidden md:flex items-center gap-6 shadow-2xl border border-zinc-800/60 backdrop-blur-md"
      >
        <button onClick={() => scrollToSection("hero")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Home</button>
        <button onClick={() => scrollToSection("about")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">About</button>
        <button onClick={() => scrollToSection("skills")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Skills</button>
        <button onClick={() => scrollToSection("experience")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Exp</button>
        <button onClick={() => scrollToSection("projects")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Projects</button>
        <button onClick={() => scrollToSection("architecture")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Arch</button>
        <button onClick={() => scrollToSection("certifications")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Certs</button>
        <button onClick={() => scrollToSection("blog")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Blog</button>
        <button onClick={() => scrollToSection("contact")} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">Contact</button>
      </motion.div>

      {/* CMS DASHBOARD OVERLAY */}
      <AnimatePresence>
        {isCmsOpen && (
          <Dashboard 
            onClose={() => setIsCmsOpen(false)} 
            portfolioData={portfolio}
            refetchPortfolio={fetchPortfolioData}
          />
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL DRAWER FOR PROJECT SPECIMEN INSPECTION
         ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeDetailProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-sans backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 text-left scrollbar-thin shadow-2xl relative ${isLightMode ? "bg-white border border-zinc-200 text-zinc-900" : "glass bg-[#18181B]/95"}`}
            >
              <button 
                onClick={() => setActiveDetailProject(null)}
                className="absolute top-6 right-6 p-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 border border-zinc-850 px-3 py-1 rounded-full">{activeDetailProject.category}</span>
              <h3 className="text-2xl font-sans font-bold text-white mt-4">{activeDetailProject.title}</h3>
              
              {/* Image banner inside details */}
              <div className="mt-6 rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 h-64 sm:h-80">
                <img 
                  src={activeDetailProject.thumbnail} 
                  alt={activeDetailProject.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">PROJECT DEEP DIVE</h4>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{activeDetailProject.description}</p>
                  
                  {activeDetailProject.features && activeDetailProject.features.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">KEY ARCHITECTURAL FEATURES</h4>
                      <ul className="space-y-1.5">
                        {activeDetailProject.features.map((feat, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-blue-500 font-bold mt-0.5">•</span> {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 space-y-6">
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">TECH SPECS</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDetailProject.techStack.map((tech, i) => (
                        <span key={i} className="px-2 py-1 rounded text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase">STATUS CODE</h4>
                    <p className="text-xs text-zinc-300 font-mono flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full inline-block ${activeDetailProject.status === "Completed" ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"}`}></span>
                      {activeDetailProject.status}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <button
                      onClick={() => window.open(activeDetailProject.githubUrl, "_blank")}
                      className="w-full py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-sans font-medium flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
                    >
                      <Github className="h-4 w-4" /> Source Code
                    </button>
                    {activeDetailProject.liveUrl && activeDetailProject.liveUrl !== "#" && (
                      <button
                        onClick={() => window.open(activeDetailProject.liveUrl, "_blank")}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" /> Live Interface
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL DRAWER FOR BLOG ARTICLES READING VIEW
         ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeReadBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-sans backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 text-left scrollbar-thin shadow-2xl relative ${isLightMode ? "bg-white border border-zinc-200 text-zinc-900" : "glass bg-[#18181B]/95"}`}
            >
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?blog=${activeReadBlog.slug}`;
                    if (navigator.share) {
                      navigator.share({
                        title: activeReadBlog.title,
                        text: `Check out this article: ${activeReadBlog.title}`,
                        url: shareUrl,
                      }).catch(err => console.error("Error sharing", err));
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="p-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Share Article"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setActiveReadBlog(null)}
                  className="p-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Close Article"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-zinc-500 mb-4 pr-24">
                <span>{activeReadBlog.publishDate}</span>
                <span>{activeReadBlog.readingTime}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-blue-500/5 border border-blue-500/10 text-blue-400">{activeReadBlog.category}</span>
              
              <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-white mt-4 mb-6 leading-snug">{activeReadBlog.title}</h3>

              {activeReadBlog.featuredImage && (
                <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 h-56 sm:h-72 mb-6">
                  <img src={activeReadBlog.featuredImage} alt={activeReadBlog.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Parsed Blog Content container */}
              <div className="space-y-2 mt-6 border-t border-zinc-800/60 pt-6">
                {renderMarkdown(activeReadBlog.content)}
              </div>

              <div className="flex justify-between items-center pt-8 mt-8 border-t border-zinc-800 text-xs font-mono text-zinc-500">
                <span>Author node: {activeReadBlog.author}</span>
                <button 
                  onClick={() => setActiveReadBlog(null)}
                  className="text-blue-400 hover:underline cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
