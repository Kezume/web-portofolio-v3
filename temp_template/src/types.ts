export interface Profile {
  headline: string;
  subtitle: string;
  description: string;
  biography: string;
  profileImage: string;
  resumeUrl: string;
  education: string;
  stats: {
    projectsCount: number;
    reposCount: number;
    techCount: number;
    yearsExp: number;
  };
}

export interface Skill {
  id: string;
  category: "Backend" | "Frontend" | "Database" | "DevOps" | "Other";
  name: string;
  percentage: number;
  icon: string;
  order: number;
  visibility: boolean;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  duration: string;
  description: string;
  technology: string[];
  logo: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  gallery: string[];
  description: string;
  techStack: string[];
  features: string[];
  githubUrl: string;
  liveUrl: string;
  status: "Completed" | "In Progress" | "Archived";
  featured: boolean;
  tags: string[];
}

export interface Certificate {
  id: string;
  name: string;
  certificateImage: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  author: string;
  readingTime: string;
  featuredImage: string;
  tags: string[];
  status: "Draft" | "Published";
  publishDate: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  comment: string;
  rating: number;
  avatar: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  replyStatus: "Pending" | "Replied";
  readStatus: "Unread" | "Read";
}

export interface SocialLink {
  github: string;
  linkedin: string;
  instagram: string;
  email: string;
  whatsapp: string;
}

export interface Setting {
  siteLogo: string;
  siteName: string;
  theme: "dark" | "light";
  footerText: string;
  analyticsEnabled: boolean;
}

export interface VisitorMetric {
  id: string;
  ip: string;
  page: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
  country: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalPageViews: number;
  uniqueVisitorsCount: number;
  pageViewsByPage: Record<string, number>;
  visitorsByDay: Record<string, number>;
  visitorsByCountry: Record<string, number>;
  recentViews: Array<{
    id: string;
    page: string;
    timestamp: string;
    country: string;
    ip: string;
  }>;
}
