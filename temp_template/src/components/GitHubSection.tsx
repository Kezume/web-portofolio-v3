import { useState } from "react";
import { motion } from "motion/react";
import { GitFork, Star, ArrowUpRight, Github, Code2, Users, Flame } from "lucide-react";

export default function GitHubSection({ isLightMode }: { isLightMode?: boolean }) {
  const [hoveredDay, setHoveredDay] = useState<{ count: number; date: string } | null>(null);

  // Generate 12 months x 4.3 weeks x 7 days of realistic high-activity coding contributions
  const generateContributions = () => {
    const data = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 250); // go back 250 days

    for (let i = 0; i < 245; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Fluctuating activity rates: more activity mid-week, less on weekends
      const dayOfWeek = date.getDay();
      let activityFactor = Math.floor(Math.random() * 8);
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        activityFactor = Math.floor(Math.random() * 3); // quiet weekends
      }
      
      data.push({
        count: activityFactor,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      });
    }
    return data;
  };

  const contributions = generateContributions();

  const pinnedRepos = [
    {
      name: "go-sliding-limiter",
      desc: "Fast, distributed token-bucket rate limiter middleware for HTTP routing clusters backed by Redis scripting layers.",
      lang: "Go",
      langColor: "bg-cyan-500",
      stars: 142,
      forks: 24,
      link: "https://github.com"
    },
    {
      name: "next-clean-boilerplate",
      desc: "Production-ready template for Next.js 15 featuring hexagonal Clean Architecture layers, fully decoupled DB proxies.",
      lang: "TypeScript",
      langColor: "bg-blue-500",
      stars: 89,
      forks: 12,
      link: "https://github.com"
    },
    {
      name: "redis-distributed-lock",
      desc: "Highly robust Redlock implementation in NestJS for microservices synchronization, complete with exponential backoff retries.",
      lang: "TypeScript",
      langColor: "bg-blue-500",
      stars: 114,
      forks: 18,
      link: "https://github.com"
    }
  ];

  // Helper to resolve contribution block colors
  const getColorClass = (count: number) => {
    if (count === 0) return isLightMode ? "bg-zinc-100 border border-zinc-200" : "bg-zinc-900 border border-zinc-900/10";
    if (count <= 2) return "bg-emerald-950/80 hover:bg-emerald-950";
    if (count <= 4) return "bg-emerald-850 hover:bg-emerald-800";
    if (count <= 6) return "bg-emerald-600 hover:bg-emerald-500";
    return "bg-emerald-400 hover:bg-emerald-300";
  };

  return (
    <section id="github" className={`py-20 border-t transition-colors duration-200 ${isLightMode ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950/20 border-zinc-900"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-xs font-mono font-medium tracking-widest text-emerald-500 uppercase">
              OPEN SOURCE
            </span>
            <h2 className={`text-3xl sm:text-4xl font-sans font-bold tracking-tight mt-3 flex items-center gap-3 ${isLightMode ? "text-zinc-900" : "text-white"}`}>
              GitHub Metrics & Activity <Github className="h-7 w-7 text-zinc-400" />
            </h2>
            <p className={`text-sm mt-3 font-sans max-w-2xl ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
              I actively support open-source ecosystems by building resilient middleware, database boilerplates, and developer CLI utilities.
            </p>
          </div>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer shadow-lg ${isLightMode ? "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100" : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"}`}
          >
            Follow @roihan <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
          </a>
        </div>

        {/* Stats Summary Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "STREAK", value: "45 Days Solid", icon: Flame, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "TOTAL REPOS", value: "48 Active", icon: Code2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { label: "EARNED STARS", value: "480+ Stars", icon: Star, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
            { label: "CONTRIBUTIONS YR", value: "1,240+ Commits", icon: Users, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01] ${isLightMode ? "bg-white border border-zinc-200 shadow-sm" : "glass"}`}>
                <div className={`p-3 rounded-xl border ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-mono">{item.label}</p>
                  <h3 className={`text-xl font-sans font-bold mt-1 ${isLightMode ? "text-zinc-800" : "text-zinc-100"}`}>{item.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contribution Map Panel */}
        <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-sm mb-12 ${isLightMode ? "bg-white border border-zinc-200 shadow-sm" : "glass"}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-sm font-sans font-semibold flex items-center gap-2 ${isLightMode ? "text-zinc-800" : "text-zinc-100"}`}>
              Contribution History <span className="text-xs font-mono font-normal text-zinc-500">(Past 245 Days)</span>
            </h3>
            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <span>Less</span>
              <div className={`h-2.5 w-2.5 rounded ${isLightMode ? "bg-zinc-100 border border-zinc-200" : "bg-zinc-900"}`}></div>
              <div className="h-2.5 w-2.5 rounded bg-emerald-950"></div>
              <div className="h-2.5 w-2.5 rounded bg-emerald-800"></div>
              <div className="h-2.5 w-2.5 rounded bg-emerald-600"></div>
              <div className="h-2.5 w-2.5 rounded bg-emerald-400"></div>
              <span>More</span>
            </div>
          </div>

          {/* Grid canvas */}
          <div className="relative min-h-[110px] overflow-x-auto pb-4">
            <div className="min-w-[700px] grid grid-flow-col grid-rows-7 gap-1.5 justify-start">
              {contributions.map((day, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-2.5 w-2.5 rounded-[2px] transition-colors cursor-crosshair ${getColorClass(day.count)}`}
                />
              ))}
            </div>

            {/* Hover details tooltips */}
            <div className="h-6 mt-4 flex items-center justify-center sm:justify-start">
              <p className="text-[11px] font-mono text-zinc-500">
                {hoveredDay 
                  ? `${hoveredDay.count === 0 ? "No" : hoveredDay.count} contribution${hoveredDay.count === 1 ? "" : "s"} on ${hoveredDay.date}`
                  : "💡 Hover over any block to inspect commit metrics."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Pinned Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pinnedRepos.map((repo, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${isLightMode ? "bg-white border border-zinc-200 shadow-sm" : "glass"}`}
              onClick={() => window.open(repo.link, "_blank")}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Active Repo
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 hover:text-zinc-200" />
                </div>
                <h3 className={`text-sm font-mono font-semibold transition-colors ${isLightMode ? "text-zinc-800 hover:text-emerald-600" : "text-zinc-100 hover:text-emerald-400"}`}>
                  {repo.name}
                </h3>
                <p className={`text-xs font-sans mt-3 leading-relaxed ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  {repo.desc}
                </p>
              </div>

              <div className={`flex items-center gap-4 mt-6 pt-4 border-t text-xs font-mono text-zinc-500 ${isLightMode ? "border-zinc-200" : "border-zinc-800/60"}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${repo.langColor}`}></span>
                  <span>{repo.lang}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" />
                  <span>{repo.forks}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
