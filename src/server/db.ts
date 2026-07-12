import { db } from "./firebase.js";
import {
  Profile, Skill, Experience, Project, Certificate,
  Blog, Testimonial, Message, SocialLink, Setting,
  VisitorMetric, AnalyticsSummary
} from "../types.js";

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
  adminPasswordHash: string;
}

const DEFAULT_DB: DatabaseSchema = {
  profile: {
    headline: "Software Engineer",
    subtitle: "Backend Specialist & Full-Stack Developer",
    description: "Architecting high-performance REST & GraphQL APIs, distributed microservices, and elegant web solutions with clean codebase.",
    biography: "I am a Software Engineer specializing in high-performance backend systems, microservice architectures, and modern web applications. With a passion for clean code and performance optimization, I design scalable APIs, optimize SQL/NoSQL databases, and build interactive user experiences.",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    resumeUrl: "#",
    education: "B.S. in Computer Science",
    stats: { projectsCount: 14, reposCount: 48, techCount: 16, yearsExp: 4 }
  },
  skills: [],
  experiences: [],
  projects: [],
  certificates: [],
  blogs: [],
  testimonials: [],
  messages: [],
  socials: {
    github: "https://github.com/Kezume",
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
  adminPasswordHash: "admin"
};

const DOC_ID = "main_data";
const COLLECTION_NAME = "portfolio";

// ===================================================================
// In-memory cache to avoid hitting Firestore on every request.
// Cache is invalidated/updated whenever writeDB() is called.
// ===================================================================
let _cache: DatabaseSchema | null = null;

export async function readDB(): Promise<DatabaseSchema> {
  if (_cache) return _cache;
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      _cache = docSnap.data() as DatabaseSchema;
      return _cache;
    } else {
      // First-time: seed Firestore with default data
      await docRef.set(DEFAULT_DB);
      _cache = DEFAULT_DB;
      return _cache;
    }
  } catch (error) {
    console.error("Error reading from Firestore:", error);
    return _cache ?? DEFAULT_DB;
  }
}

export async function writeDB(data: DatabaseSchema) {
  const docRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
  await docRef.set(data);
  _cache = data; // keep cache in sync
}

// Analytics — reads from the dedicated visitorMetrics collection
export async function getAnalytics(): Promise<AnalyticsSummary> {
  const snapshot = await db
    .collection("visitorMetrics")
    .orderBy("timestamp", "desc")
    .get();

  const metrics: VisitorMetric[] = snapshot.docs.map(d => d.data() as VisitorMetric);

  const totalPageViews = metrics.length;
  const uniqueIps = new Set(metrics.map(m => m.ip));
  const uniqueVisitorsCount = uniqueIps.size;

  const pageViewsByPage: Record<string, number> = {};
  const visitorsByDay: Record<string, number> = {};
  const visitorsByCountry: Record<string, number> = {};

  for (const metric of metrics) {
    pageViewsByPage[metric.page] = (pageViewsByPage[metric.page] || 0) + 1;

    try {
      const dateStr = new Date(metric.timestamp).toISOString().split("T")[0];
      visitorsByDay[dateStr] = (visitorsByDay[dateStr] || 0) + 1;
    } catch { /* ignore malformed timestamps */ }

    const country = metric.country || "Unknown";
    visitorsByCountry[country] = (visitorsByCountry[country] || 0) + 1;
  }

  const recentViews = metrics.slice(0, 15).map(m => ({
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

const COUNTRY_MAP: [((ip: string) => boolean), string][] = [
  [ip => ip === "8.8.8.8" || ip.startsWith("10."), "United States"],
  [ip => ip.startsWith("45."), "Singapore"],
  [ip => ip.startsWith("12."), "United Kingdom"],
  [ip => ip.startsWith("144."), "Germany"],
  [ip => ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.") || ip.startsWith("::ffff:127."), "Indonesia"],
];

const FALLBACK_COUNTRIES = ["Indonesia", "United States", "Singapore", "Japan", "Germany", "Australia", "India"];

function geolocateIp(ip: string): string {
  for (const [matcher, country] of COUNTRY_MAP) {
    if (matcher(ip)) return country;
  }
  return FALLBACK_COUNTRIES[Math.floor(Math.random() * FALLBACK_COUNTRIES.length)];
}

// Log a visitor — async, called fire-and-forget from middleware
export async function logVisitor(ip: string, page: string, referrer: string, userAgent: string) {
  const metric: VisitorMetric = {
    id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ip,
    page,
    referrer: referrer || "",
    userAgent: userAgent || "",
    timestamp: new Date().toISOString(),
    country: geolocateIp(ip)
  };

  await db.collection("visitorMetrics").add(metric);
}

// Clear all visitor metrics from Firestore
export async function clearAnalytics() {
  const collectionRef = db.collection("visitorMetrics");
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
