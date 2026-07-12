import { useState } from "react";
import { motion } from "motion/react";
import { Server, ShieldCheck, Database, Layers, GitBranch, Cpu, ArrowRight } from "lucide-react";

export default function BackendArchitecture({ isLightMode }: { isLightMode?: boolean }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: "Client Layer",
      icon: Layers,
      color: "from-blue-500 to-indigo-500",
      glow: "shadow-blue-500/20",
      desc: "Single Page Application or Mobile Client sending HTTP/gRPC requests securely with SSL/TLS encryption.",
    },
    {
      id: 2,
      title: "Authentication & Gateway",
      icon: ShieldCheck,
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/20",
      desc: "JWT Claims verification, Dynamic IP Rate-Limiting with Redis, and routing authorization protocols.",
    },
    {
      id: 3,
      title: "REST / GraphQL API Controllers",
      icon: Server,
      color: "from-teal-500 to-cyan-500",
      glow: "shadow-teal-500/20",
      desc: "Express/Go route routers mapping entry payloads, validating models, and binding controllers to business interactors.",
    },
    {
      id: 4,
      title: "Domain Business Logic",
      icon: Cpu,
      color: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/20",
      desc: "Core business rules, entities validation, and high-cohesion processes entirely isolated from external DB frameworks.",
    },
    {
      id: 5,
      title: "Repository Adapter",
      icon: GitBranch,
      color: "from-amber-500 to-emerald-500",
      glow: "shadow-amber-500/20",
      desc: "Data-mapping interfaces separating databases implementations from core business logic (implements SOLID/Dependency Inversion).",
    },
    {
      id: 6,
      title: "Durable PostgreSQL Database",
      icon: Database,
      color: "from-orange-500 to-amber-500",
      glow: "shadow-orange-500/20",
      desc: "Relational tables with ACID constraints, complex indexes, read-replicas, and query caches via Redis.",
    }
  ];

  const cards = [
    {
      title: "Clean Architecture",
      desc: "Separating software layers makes systems robust, testable, and completely independent of third-party drivers or UI changes.",
      tag: "Robust Separation"
    },
    {
      title: "Repository Pattern",
      desc: "De-couples core database engines from business logic, ensuring query mechanics can be modified or cached without touching rules.",
      tag: "DB Agnostic"
    },
    {
      title: "Microservices",
      desc: "Distributes domain tasks into independent services that communicate over high-speed RPC, increasing system scalability.",
      tag: "Scale-to-Infinity"
    },
    {
      title: "MVC Pattern",
      desc: "Splits concerns cleanly into Models for data rules, Views for interactive layout outputs, and Controllers for input routing.",
      tag: "Cohesive Routing"
    }
  ];

  return (
    <section id="architecture" className={`py-20 border-t relative overflow-hidden transition-colors duration-200 ${isLightMode ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950/20 border-zinc-900"}`}>
      {/* Background radial glow */}
      {!isLightMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-mono font-medium tracking-widest text-blue-500 uppercase"
          >
            SYSTEM DESIGN
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-3xl sm:text-4xl font-sans font-bold tracking-tight mt-3 ${isLightMode ? "text-zinc-900" : "text-white"}`}
          >
            Backend Architecture Blueprint
          </motion.h2>
          <p className={`text-sm mt-4 font-sans leading-relaxed ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
            High-performance web backends require intentional architectural standards. 
            Here is the typical request-response data pipeline designed for high scale and strict security.
          </p>
        </div>

        {/* Infographic Map */}
        <div className={`relative p-8 rounded-3xl backdrop-blur-sm mb-16 overflow-x-auto ${isLightMode ? "bg-white border border-zinc-200 shadow-sm" : "glass"}`}>
          <div className="min-w-[900px] flex items-center justify-between gap-4 py-8 relative">
            {/* Connecting flow line */}
            <div className={`absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 -z-10 ${isLightMode ? "bg-zinc-200" : "bg-zinc-800"}`}>
              <motion.div 
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
            </div>

            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => setActiveStep(idx)}
                    onHoverEnd={() => setActiveStep(null)}
                    className={`h-16 w-16 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${step.glow} hover:border-zinc-500/50 ${isLightMode ? "bg-zinc-100 border border-zinc-200 shadow-sm" : "bg-zinc-950 border border-zinc-800"}`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} text-zinc-950 shadow-md`}>
                      <StepIcon className="h-6 w-6" />
                    </div>
                  </motion.div>
                  
                  <span className="text-[11px] font-mono text-zinc-500 mt-4">STEP 0{step.id}</span>
                  <h4 className={`text-xs font-sans font-medium mt-1 whitespace-nowrap ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>{step.title}</h4>

                  {/* Flow Arrow */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-[28px] -right-[16px] text-zinc-600 hidden">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Step Description Panel */}
          <div className="mt-6 border-t border-zinc-800/60 pt-6 h-20 flex items-center justify-center text-center">
            <motion.p
              key={activeStep !== null ? activeStep : "default"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs sm:text-sm max-w-2xl font-sans ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
            >
              {activeStep !== null 
                ? steps[activeStep].desc 
                : "💡 Hover over any node in the blueprint pipeline above to inspect its engineering characteristics and role in the pipeline."
              }
            </motion.p>
          </div>
        </div>

        {/* Structural Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-2xl transition-all cursor-default ${isLightMode ? "bg-white border border-zinc-200 shadow-sm" : "glass"}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium text-blue-400 bg-blue-500/5 border border-blue-500/10">
                  {card.tag}
                </span>
                <span className="text-[11px] font-mono text-zinc-600">0{idx + 1}</span>
              </div>
              <h3 className={`text-base font-sans font-semibold ${isLightMode ? "text-zinc-800" : "text-zinc-100"}`}>{card.title}</h3>
              <p className={`text-xs mt-2.5 font-sans leading-relaxed ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
