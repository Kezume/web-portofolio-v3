import fs from "fs";
import path from "path";
import { 
  Profile, Skill, Experience, Project, Certificate, 
  Blog, Testimonial, Message, SocialLink, Setting, 
  VisitorMetric, AnalyticsSummary 
} from "../types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DatabaseSchema {
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  blogs: Blog[];
  testimonials: Testimonial[];
  messages: Message[];
  socials: SocialLink;
  settings: Setting;
  visitorMetrics: VisitorMetric[];
  adminPasswordHash: string; // Plain password for ease in this sandbox, e.g. "admin"
}

const DEFAULT_DB: DatabaseSchema = {
  profile: {
    headline: "Software Engineer",
    subtitle: "Backend Specialist & Full-Stack Developer",
    description: "Architecting high-performance REST & GraphQL APIs, distributed microservices, and elegant web solutions with clean codebase.",
    biography: "I am a Software Engineer specializing in high-performance backend systems, microservice architectures, and modern web applications. With a passion for clean code and performance optimization, I design scalable APIs, optimize SQL/NoSQL databases, and build interactive user experiences. I thrive on solving complex engineering challenges and automating cloud-native deployments.",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    resumeUrl: "#",
    education: "B.S. in Computer Science - Universitas Indonesia (2019 - 2023)",
    stats: {
      projectsCount: 14,
      reposCount: 48,
      techCount: 16,
      yearsExp: 4
    }
  },
  skills: [
    { id: "s1", category: "Backend", name: "Golang", percentage: 90, icon: "terminal", order: 1, visibility: true },
    { id: "s2", category: "Backend", name: "Node.js (Nest/Express)", percentage: 95, icon: "cpu", order: 2, visibility: true },
    { id: "s3", category: "Backend", name: "Laravel / PHP", percentage: 85, icon: "code", order: 3, visibility: true },
    { id: "s4", category: "Frontend", name: "React / Next.js", percentage: 88, icon: "layers", order: 4, visibility: true },
    { id: "s5", category: "Frontend", name: "TypeScript", percentage: 92, icon: "shield", order: 5, visibility: true },
    { id: "s6", category: "Frontend", name: "Tailwind CSS", percentage: 95, icon: "palette", order: 6, visibility: true },
    { id: "s7", category: "Database", name: "PostgreSQL", percentage: 90, icon: "database", order: 7, visibility: true },
    { id: "s8", category: "Database", name: "Redis (Caching & PubSub)", percentage: 85, icon: "zap", order: 8, visibility: true },
    { id: "s9", category: "DevOps", name: "Docker & Docker Compose", percentage: 85, icon: "container", order: 9, visibility: true },
    { id: "s10", category: "DevOps", name: "GitHub Actions (CI/CD)", percentage: 80, icon: "workflow", order: 10, visibility: true },
    { id: "s11", category: "Other", name: "Clean Architecture", percentage: 95, icon: "grid", order: 11, visibility: true }
  ],
  experiences: [
    {
      id: "e1",
      position: "Senior Backend Engineer",
      company: "Aether Digital Group",
      duration: "2024 - Present",
      description: "Leading the core API development using Go and NestJS. Architected a distributed transaction microservice cluster, decreasing latency by 35% and improving uptime to 99.95%. Designed database schemas in PostgreSQL with complex query optimizations and indexing.",
      technology: ["Golang", "PostgreSQL", "Docker", "Redis", "gRPC", "Kafka"],
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: "e2",
      position: "Full-Stack Web Developer",
      company: "Nexus Creative Lab",
      duration: "2022 - 2024",
      description: "Built responsive client portals and content dashboards using Next.js, Laravel, and MySQL. Collaborated closely with design teams to craft pixel-perfect user interfaces, utilizing Tailwind CSS and Framer Motion. Set up deployment pipelines on VPS via Docker.",
      technology: ["Laravel", "React", "Next.js", "MySQL", "Tailwind CSS", "Nginx"],
      logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: "e3",
      position: "Backend Development Intern",
      company: "Inovasi Global Tech",
      duration: "2021 - 2022",
      description: "Assisted in maintaining legacy PHP backends and writing unit tests using PHPUnit. Refactored bloated controllers into service-repository patterns. Integrated third-party payment gateways and webhook alert notification queues.",
      technology: ["PHP", "Laravel", "MySQL", "Postman", "Redis"],
      logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=100&auto=format&fit=crop"
    }
  ],
  projects: [
    {
      id: "p1",
      title: "Aetheria Distributed API Gateway",
      slug: "aetheria-api-gateway",
      category: "Backend Architecture",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"
      ],
      description: "A secure, blazing-fast distributed API gateway built in Golang. It features JWT claims token verification, robust Redis-backed dynamic rate limiting (sliding window token bucket algorithm), circuit breaking, dynamic upstream routing, and integrated prometheus telemetry endpoints.",
      techStack: ["Golang", "Redis", "Docker", "gRPC", "Prometheus"],
      features: [
        "Dynamic sliding window token bucket rate limiter.",
        "JSON Web Token (JWT) claims decoding and routing headers injection.",
        "Circuit breaker pattern to isolate failing upstream microservices.",
        "gRPC to REST payload transcoding layers.",
        "Prometheus & Grafana dashboard metrics output."
      ],
      githubUrl: "https://github.com",
      liveUrl: "#",
      status: "Completed",
      featured: true,
      tags: ["High Performance", "Microservices", "Security", "Go"]
    },
    {
      id: "p2",
      title: "Nova Collaborative Project Hub",
      slug: "nova-collaborative-hub",
      category: "Full-Stack System",
      thumbnail: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"
      ],
      description: "A highly interactive, real-time board system inspired by Linear and Trello. Created with Next.js and Node.js. Includes instant canvas sync via WebSockets, automatic offline persistence synchronizer, bento-grid progress analytics, multi-tenant workspace division, and automated task prioritization based on priority weightings.",
      techStack: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Socket.io"],
      features: [
        "Real-time team cursor tracking and item card updates.",
        "Rich text workspace editor with Markdown parse nodes.",
        "Bento-style personal performance and workload metrics.",
        "Integrated drag-and-drop mechanics with fluid layout transitions.",
        "Automated activity logs and project milestone completion indicators."
      ],
      githubUrl: "https://github.com",
      liveUrl: "#",
      status: "Completed",
      featured: true,
      tags: ["Real-time", "UX / Design", "Collaboration", "Productivity"]
    },
    {
      id: "p3",
      title: "Zenith Decentralized Storage Cloud",
      slug: "zenith-decentralized-cloud",
      category: "DevOps & Cloud Integration",
      thumbnail: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=600&auto=format&fit=crop"
      ],
      description: "An encrypted cloud storage proxy manager built for secure corporate backups. It features end-to-end client-side encryption, high-volume chunked file uploads streaming, automated compression layers, and a robust fallback mechanism that balances loads between AWS S3, Cloudinary, and regional private storage servers.",
      techStack: ["TypeScript", "Node.js", "Docker", "Nginx", "Cloudinary", "AWS S3"],
      features: [
        "Parallel chunked uploads with automatic resume capability.",
        "E2E AES-GCM-256 client-side file encryption.",
        "Automatic server-side image compression and webp conversion.",
        "Nginx reverse-proxy caching with file-load-balancer logic."
      ],
      githubUrl: "https://github.com",
      liveUrl: "#",
      status: "Completed",
      featured: false,
      tags: ["Security", "Docker", "S3 Storage", "Infrastructure"]
    }
  ],
  certificates: [
    {
      id: "c1",
      name: "Google Cloud Certified: Professional Cloud Developer",
      certificateImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=300&auto=format&fit=crop",
      issuer: "Google Cloud",
      date: "Oct 2025",
      credentialUrl: "#"
    },
    {
      id: "c2",
      name: "AWS Certified Solutions Architect - Associate",
      certificateImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop",
      issuer: "Amazon Web Services (AWS)",
      date: "Mar 2024",
      credentialUrl: "#"
    }
  ],
  blogs: [
    {
      id: "b1",
      title: "Designing Resilient Microservices with Clean Architecture",
      slug: "designing-resilient-microservices-clean-architecture",
      content: "Microservices have revolutionized software architecture, but they come with significant costs—mainly distributed system complexity. In this article, we'll explore how to apply Clean Architecture principles to separate core business entities from external transport protocols (HTTP/gRPC) and database providers. By decoupling these layers, we build codebases that are highly testable, extremely adaptable, and robust against third-party dependency updates.\n\n### Core Clean Architecture Layers\n\n1. **Entities**: Represent core business data structures and invariants.\n2. **Use Cases (Interactors)**: Contain application-specific rules and orchestrate data flow.\n3. **Interface Adapters (Controllers/Presenters/Gateways)**: Translate data between use cases and external frameworks.\n4. **Frameworks & Drivers**: Consist of databases, web routers, and file systems.\n\nFollowing this flow ensures your database engines can be swapped without touching a single business rule!",
      category: "System Design",
      author: "Roihan",
      readingTime: "5 min read",
      featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop",
      tags: ["Clean Architecture", "Microservices", "Patterns"],
      status: "Published",
      publishDate: "2026-06-15"
    },
    {
      id: "b2",
      title: "Why Go is My Choice for High-Performance Backend Infrastructure",
      slug: "why-go-choice-high-performance-backend-infrastructure",
      content: "When building high-concurrency systems, you need a language that compiles fast, executes efficiently, and handles concurrent paths with minimal CPU overhead. Go excels in all these areas. Through lightweight Goroutines and channels, Go models concurrency natively without thread-context-switching bottlenecks. In this deep dive, we compare Go, Node.js, and Java, demonstrating why Go is the ideal language for modern cloud systems and high-traffic APIs.",
      category: "Go Lang",
      author: "Roihan",
      readingTime: "4 min read",
      featuredImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=500&auto=format&fit=crop",
      tags: ["Golang", "Concurrency", "Performance"],
      status: "Published",
      publishDate: "2026-05-10"
    },
    {
      id: "b3",
      title: "Advanced Caching Strategies in Distributed Systems",
      slug: "advanced-caching-strategies-distributed-systems",
      content: "Caching is the ultimate hack for speed, but cache invalidation remains one of the hardest problems in Computer Science. In this article, we cover cache-aside, write-through, and read-through caching structures using Redis, and discuss how to prevent Cache Stampede and Cache Penetration using singleflight mechanics and bloom filters.",
      category: "Database",
      author: "Roihan",
      readingTime: "6 min read",
      featuredImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=500&auto=format&fit=crop",
      tags: ["Redis", "Caching", "PostgreSQL"],
      status: "Published",
      publishDate: "2026-04-02"
    }
  ],
  testimonials: [
    {
      id: "t1",
      name: "Marcus Aurelius",
      position: "Engineering Director",
      company: "Aura Tech Solutions",
      comment: "Roihan is an exceptional developer. He refactored our core message broker flow and improved performance by 30%. His attention to Clean Architecture and type safety was incredibly impressive.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: "t2",
      name: "Sarah Jenkins",
      position: "Product Manager",
      company: "Nexus Creative",
      comment: "Working with Roihan was smooth. He delivered the admin dashboard and full-stack project hub ahead of schedule and with beautiful animations. He has a rare mix of high engineering skills and stellar UI sense.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
    }
  ],
  messages: [
    {
      id: "m1",
      name: "John Doe",
      email: "john@example.com",
      subject: "Potential Project Collaboration",
      message: "Hello Roihan, I love your portfolio and backend architectural designs. We are looking for a contract backend engineer to help us migrate a Laravel application into Go microservices. Let's arrange a call next week if you're open to freelance projects!",
      date: "2026-07-11T14:30:00.000Z",
      replyStatus: "Pending",
      readStatus: "Unread"
    },
    {
      id: "m2",
      name: "Emily Watson",
      email: "emily.recruit@globetech.com",
      subject: "Backend Role Opportunity at GlobeTech",
      message: "Hi Roihan, I came across your GitHub profile and your blog post about Clean Architecture. We have an open Senior Backend Developer position in Jakarta. Your experience matches perfectly! Let me know if we can schedule a quick introductory chat.",
      date: "2026-07-10T09:15:00.000Z",
      replyStatus: "Replied",
      readStatus: "Read"
    }
  ],
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    email: "roihanabcd@gmail.com",
    whatsapp: "https://wa.me/#"
  },
  settings: {
    siteLogo: "R",
    siteName: "Roihan Portfolio",
    theme: "dark",
    footerText: "Designed & Built by Roihan",
    analyticsEnabled: true
  },
  visitorMetrics: [
    // Pre-seed 30 days of metrics for a gorgeous dashboard chart!
    { id: "v1", ip: "127.0.0.1", page: "/", referrer: "", userAgent: "Mozilla", timestamp: "2026-07-11T20:00:00.000Z", country: "Indonesia" },
    { id: "v2", ip: "8.8.8.8", page: "/blog", referrer: "google.com", userAgent: "Chrome", timestamp: "2026-07-11T18:30:00.000Z", country: "United States" },
    { id: "v3", ip: "127.0.0.1", page: "/", referrer: "", userAgent: "Mozilla", timestamp: "2026-07-10T12:00:00.000Z", country: "Indonesia" },
    { id: "v4", ip: "45.1.2.3", page: "/projects", referrer: "linkedin.com", userAgent: "Safari", timestamp: "2026-07-10T15:45:00.000Z", country: "Singapore" },
    { id: "v5", ip: "12.3.4.5", page: "/", referrer: "github.com", userAgent: "Chrome", timestamp: "2026-07-09T14:20:00.000Z", country: "United Kingdom" },
    { id: "v6", ip: "45.1.2.3", page: "/", referrer: "", userAgent: "Safari", timestamp: "2026-07-08T10:10:00.000Z", country: "Singapore" },
    { id: "v7", ip: "127.0.0.1", page: "/blog", referrer: "", userAgent: "Mozilla", timestamp: "2026-07-07T08:00:00.000Z", country: "Indonesia" },
    { id: "v8", ip: "144.2.3.4", page: "/", referrer: "google.com", userAgent: "Firefox", timestamp: "2026-07-06T19:30:00.000Z", country: "Germany" },
    { id: "v9", ip: "12.3.4.5", page: "/", referrer: "", userAgent: "Chrome", timestamp: "2026-07-05T11:45:00.000Z", country: "United Kingdom" },
    { id: "v10", ip: "8.8.8.8", page: "/", referrer: "google.com", userAgent: "Chrome", timestamp: "2026-07-04T15:10:00.000Z", country: "United States" }
  ],
  adminPasswordHash: "admin" // For demonstration in AI Studio, password is "admin"
};

// Initialize DB file
function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
}

initDB();

export function readDB(): DatabaseSchema {
  try {
    initDB();
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, using fallback:", error);
    return DEFAULT_DB;
  }
}

export function writeDB(data: DatabaseSchema) {
  try {
    initDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Analytics engine to compute analytics summary
export function getAnalytics(): AnalyticsSummary {
  const db = readDB();
  const metrics = db.visitorMetrics || [];
  
  const totalPageViews = metrics.length;
  const uniqueIps = new Set(metrics.map(m => m.ip));
  const uniqueVisitorsCount = uniqueIps.size;
  
  const pageViewsByPage: Record<string, number> = {};
  const visitorsByDay: Record<string, number> = {};
  const visitorsByCountry: Record<string, number> = {};
  
  metrics.forEach(metric => {
    // Page count
    pageViewsByPage[metric.page] = (pageViewsByPage[metric.page] || 0) + 1;
    
    // Day count (YYYY-MM-DD)
    try {
      const dateStr = new Date(metric.timestamp).toISOString().split("T")[0];
      visitorsByDay[dateStr] = (visitorsByDay[dateStr] || 0) + 1;
    } catch (e) {}
    
    // Country count
    const country = metric.country || "Unknown";
    visitorsByCountry[country] = (visitorsByCountry[country] || 0) + 1;
  });

  // Recent logs
  const recentViews = metrics
    .slice(-15)
    .reverse()
    .map(m => ({
      id: m.id,
      page: m.page,
      timestamp: m.timestamp,
      country: m.country || "Unknown",
      ip: m.ip
    }));

  return {
    totalVisitors: uniqueVisitorsCount,
    totalPageViews,
    uniqueVisitorsCount,
    pageViewsByPage,
    visitorsByDay,
    visitorsByCountry,
    recentViews
  };
}

// Log a visitor request
export function logVisitor(ip: string, page: string, referrer: string, userAgent: string) {
  const db = readDB();
  db.visitorMetrics = db.visitorMetrics || [];

  // Geolocation mock based on typical test IPs
  let country = "Indonesia";
  if (ip === "8.8.8.8" || ip.startsWith("10.")) country = "United States";
  else if (ip.startsWith("45.")) country = "Singapore";
  else if (ip.startsWith("12.")) country = "United Kingdom";
  else if (ip.startsWith("144.")) country = "Germany";
  else if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.")) country = "Indonesia";
  else {
    const countries = ["Indonesia", "United States", "Singapore", "Japan", "Germany", "Australia", "India"];
    country = countries[Math.floor(Math.random() * countries.length)];
  }

  const metric: VisitorMetric = {
    id: "v_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    ip,
    page,
    referrer: referrer || "",
    userAgent: userAgent || "",
    timestamp: new Date().toISOString(),
    country
  };

  db.visitorMetrics.push(metric);
  writeDB(db);
}
