import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { readDB, writeDB, logVisitor, getAnalytics, clearAnalytics } from "./src/server/db";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { uploadImageToCloudinary } from "./src/server/cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Multer: store uploads in memory and pass buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const PORT = 3000;

// Body Parsers with high limits for potential gallery image base64s
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to check Auth Header
const AUTH_TOKEN = "developer-portfolio-cms-secure-token-2026";
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.split(" ")[1] === AUTH_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Admin session invalid or expired." });
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const isStatic = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|json|map)$/);
  const isApi = req.path.startsWith("/api");
  const isVite = req.path.startsWith("/@");
  const isDevAsset = req.path.includes("/src/") || req.path.includes("/node_modules/") || req.path.match(/\.(ts|tsx|jsx|json)$/);

  if (!isStatic && !isVite && !isApi && !isDevAsset && req.method === "GET") {
    const ip = req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1";
    let page = req.path;
    if (page === "") page = "/";
    // Fire-and-forget: do NOT await, so it never blocks the request chain
    logVisitor(ip, page, req.headers.referer || "", req.headers["user-agent"] || "").catch(() => {});
  }
  next();
});

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. Get entire public portfolio data
app.get("/api/portfolio", async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const { adminPasswordHash, ...publicData } = db as any;
    res.json(publicData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read portfolio database." });
  }
});

// 1.5. Log custom visitor event (Section View, Project View, Blog Read)
app.post("/api/analytics/event", async (req: Request, res: Response) => {
  try {
    const { page, referrer } = req.body;
    if (!page) {
      res.status(400).json({ error: "Missing page name." });
      return;
    }
    const ip = req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "";
    // Fire-and-forget: do NOT await, so it never blocks the request chain
    logVisitor(ip, page, referrer || "", userAgent).catch(() => {});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to log event." });
  }
});

// 2. Submit Contact Form
app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
       res.status(400).json({ error: "Missing required contact form fields." });
       return;
    }

    const db = await readDB();
    const newMessage = {
      id: "msg_" + Date.now(),
      name,
      email,
      subject: subject || "No Subject",
      message,
      date: new Date().toISOString(),
      replyStatus: "Pending" as const,
      readStatus: "Unread" as const
    };

    db.messages = db.messages || [];
    db.messages.unshift(newMessage);
    await writeDB(db);

    res.json({ success: true, message: "Message received successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit contact message." });
  }
});

// 3. AI Assistant Agent (Gemini API)
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body; // Array of { role: 'user' | 'model', content: string }
    if (!messages || !Array.isArray(messages)) {
       res.status(400).json({ error: "Messages array is required." });
       return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
       res.status(503).json({ 
        error: "AI Integration is currently in setup mode. Please ensure the GEMINI_API_KEY secret is populated in AI Studio Settings." 
      });
      return;
    }

    const db = await readDB();
    const profile = db.profile;
    const skillsList = db.skills.map(s => `- ${s.name} (${s.category}, ${s.percentage}%)`).join("\n");
    const experiencesList = db.experiences.map(e => `- ${e.position} at ${e.company} (${e.duration}): ${e.description}`).join("\n");
    const projectsList = db.projects.map(p => `- ${p.title} (${p.category}): ${p.description}. Tech: ${p.techStack.join(", ")}`).join("\n");

    const systemInstruction = `You are the personal AI Assistant of Roihan, a professional Software Engineer.
Your purpose is to chat with recruiters, prospective clients, and developers visiting Roihan's portfolio.
Answer questions objectively, professionally, and in a friendly developer tone.

Here is Roihan's official resume data from the CMS:
PROFILE:
- Title: ${profile.headline} - ${profile.subtitle}
- Summary: ${profile.description}
- Biography: ${profile.biography}
- Education: ${profile.education}

TECHNICAL SKILLS:
${skillsList}

PROFESSIONAL EXPERIENCE:
${experiencesList}

FEATURED PROJECTS:
${projectsList}

SOCIAL LINKS:
- GitHub: ${db.socials.github}
- LinkedIn: ${db.socials.linkedin}
- Email: ${db.socials.email}

INSTRUCTIONS:
1. Speak about Roihan in the third person (e.g., "Roihan has experience in...", "He designed...") or represent yourself as his dedicated AI agent.
2. Keep answers professional, crisp, and conversational. Do not make up any certifications, projects, or work history. Use ONLY the provided database facts.
3. If asked about salary, rates, or highly confidential availability, ask them to send a message via the Contact Form on the page or email him directly at ${db.socials.email}.
4. Keep markdown neat and easy to read. Use bullet points for structural data.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Reconstruct conversation parts for the Google GenAI SDK
    // The modern SDK expects an array of contents with parts
    const chatContents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Generate content
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during AI generation." });
  }
});

// ==========================================
// ADMIN / CMS MANAGEMENT API ENDPOINTS (PROTECTED)
// ==========================================

app.post('/api/admin/upload', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }
    const url = await uploadImageToCloudinary(file.buffer, 'portfolio');
    res.json({ success: true, url });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// 1. Admin Login
app.post("/api/admin/login", async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const db = await readDB();
    if (password === db.adminPasswordHash) {
      res.json({ success: true, token: AUTH_TOKEN });
    } else {
      res.status(401).json({ error: "Incorrect admin password." });
    }
  } catch (error) {
    res.status(500).json({ error: "Server login failure." });
  }
});

// 2. Change Admin Password
app.post("/api/admin/change-password", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = await readDB();
    if (currentPassword !== db.adminPasswordHash) {
       res.status(400).json({ error: "Current password verification failed." });
       return;
    }
    if (!newPassword || newPassword.trim().length < 4) {
       res.status(400).json({ error: "New password must be at least 4 characters." });
       return;
    }
    db.adminPasswordHash = newPassword.trim();
    await writeDB(db);
    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server password update failure." });
  }
});

// 3. Update Profile Data
app.put("/api/admin/profile", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.profile = { ...db.profile, ...req.body };
    await writeDB(db);
    res.json({ success: true, profile: db.profile });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// 4. Skills CRUD
app.post("/api/admin/skills", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const newSkill = {
      id: "skill_" + Date.now(),
      ...req.body,
      percentage: Number(req.body.percentage) || 0,
      order: Number(req.body.order) || db.skills.length + 1,
      visibility: req.body.visibility !== false
    };
    db.skills.push(newSkill);
    db.skills.sort((a, b) => a.order - b.order);
    await writeDB(db);
    res.json({ success: true, skill: newSkill });
  } catch (error) {
    res.status(500).json({ error: "Failed to create skill." });
  }
});

app.put("/api/admin/skills/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.skills.findIndex(s => s.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Skill not found." });
       return;
    }
    db.skills[index] = { 
      ...db.skills[index], 
      ...req.body,
      percentage: Number(req.body.percentage) ?? db.skills[index].percentage,
      order: Number(req.body.order) ?? db.skills[index].order,
    };
    db.skills.sort((a, b) => a.order - b.order);
    await writeDB(db);
    res.json({ success: true, skill: db.skills[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update skill." });
  }
});

app.delete("/api/admin/skills/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.skills = db.skills.filter(s => s.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Skill deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete skill." });
  }
});

// 5. Experiences CRUD
app.post("/api/admin/experiences", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const newExp = {
      id: "exp_" + Date.now(),
      ...req.body,
      technology: Array.isArray(req.body.technology) ? req.body.technology : []
    };
    db.experiences.unshift(newExp);
    await writeDB(db);
    res.json({ success: true, experience: newExp });
  } catch (error) {
    res.status(500).json({ error: "Failed to create experience." });
  }
});

app.put("/api/admin/experiences/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.experiences.findIndex(e => e.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Experience not found." });
       return;
    }
    db.experiences[index] = { ...db.experiences[index], ...req.body };
    await writeDB(db);
    res.json({ success: true, experience: db.experiences[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update experience." });
  }
});

app.delete("/api/admin/experiences/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.experiences = db.experiences.filter(e => e.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Experience deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete experience." });
  }
});

// 6. Projects CRUD
app.post("/api/admin/projects", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const newProj = {
      id: "proj_" + Date.now(),
      ...req.body,
      slug: (req.body.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      gallery: Array.isArray(req.body.gallery) ? req.body.gallery : [],
      techStack: Array.isArray(req.body.techStack) ? req.body.techStack : [],
      features: Array.isArray(req.body.features) ? req.body.features : [],
      featured: req.body.featured === true,
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    };
    db.projects.unshift(newProj);
    await writeDB(db);
    res.json({ success: true, project: newProj });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project." });
  }
});

app.put("/api/admin/projects/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.projects.findIndex(p => p.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Project not found." });
       return;
    }
    db.projects[index] = { 
      ...db.projects[index], 
      ...req.body,
      slug: req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : db.projects[index].slug
    };
    await writeDB(db);
    res.json({ success: true, project: db.projects[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update project." });
  }
});

app.delete("/api/admin/projects/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project." });
  }
});

// 7. Certificates CRUD
app.post("/api/admin/certificates", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const newCert = {
      id: "cert_" + Date.now(),
      ...req.body
    };
    db.certificates.push(newCert);
    await writeDB(db);
    res.json({ success: true, certificate: newCert });
  } catch (error) {
    res.status(500).json({ error: "Failed to create certificate." });
  }
});

app.put("/api/admin/certificates/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.certificates.findIndex(c => c.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Certificate not found." });
       return;
    }
    db.certificates[index] = { ...db.certificates[index], ...req.body };
    await writeDB(db);
    res.json({ success: true, certificate: db.certificates[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update certificate." });
  }
});

app.delete("/api/admin/certificates/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.certificates = db.certificates.filter(c => c.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Certificate deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete certificate." });
  }
});

// 8. Blogs CRUD
app.post("/api/admin/blogs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const readingWords = (req.body.content || "").split(/\s+/).length;
    const readingTime = Math.ceil(readingWords / 200) + " min read";

    const newBlog = {
      id: "blog_" + Date.now(),
      ...req.body,
      slug: (req.body.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      readingTime,
      publishDate: new Date().toISOString().split("T")[0],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      status: req.body.status || "Published"
    };
    db.blogs.unshift(newBlog);
    await writeDB(db);
    res.json({ success: true, blog: newBlog });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog post." });
  }
});

app.put("/api/admin/blogs/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.blogs.findIndex(b => b.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Blog post not found." });
       return;
    }

    let readingTime = db.blogs[index].readingTime;
    if (req.body.content) {
      const readingWords = req.body.content.split(/\s+/).length;
      readingTime = Math.ceil(readingWords / 200) + " min read";
    }

    db.blogs[index] = { 
      ...db.blogs[index], 
      ...req.body,
      readingTime,
      slug: req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : db.blogs[index].slug
    };
    await writeDB(db);
    res.json({ success: true, blog: db.blogs[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog post." });
  }
});

app.delete("/api/admin/blogs/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.blogs = db.blogs.filter(b => b.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Blog post deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog post." });
  }
});

// 9. Testimonials CRUD
app.post("/api/admin/testimonials", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const newTestimonial = {
      id: "test_" + Date.now(),
      ...req.body,
      rating: Number(req.body.rating) || 5
    };
    db.testimonials.push(newTestimonial);
    await writeDB(db);
    res.json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    res.status(500).json({ error: "Failed to create testimonial." });
  }
});

app.put("/api/admin/testimonials/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.testimonials.findIndex(t => t.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Testimonial not found." });
       return;
    }
    db.testimonials[index] = { 
      ...db.testimonials[index], 
      ...req.body,
      rating: Number(req.body.rating) ?? db.testimonials[index].rating
    };
    await writeDB(db);
    res.json({ success: true, testimonial: db.testimonials[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update testimonial." });
  }
});

app.delete("/api/admin/testimonials/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.testimonials = db.testimonials.filter(t => t.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Testimonial deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete testimonial." });
  }
});

// 10. Messages Inbox
app.get("/api/admin/messages", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    res.json(db.messages || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to get messages." });
  }
});

app.put("/api/admin/messages/:id/read", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.messages.findIndex(m => m.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Message not found." });
       return;
    }
    db.messages[index].readStatus = "Read";
    await writeDB(db);
    res.json({ success: true, message: db.messages[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark message as read." });
  }
});

app.put("/api/admin/messages/:id/reply", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    const index = db.messages.findIndex(m => m.id === req.params.id);
    if (index === -1) {
       res.status(404).json({ error: "Message not found." });
       return;
    }
    db.messages[index].replyStatus = req.body.replyStatus || "Replied";
    await writeDB(db);
    res.json({ success: true, message: db.messages[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update reply status." });
  }
});

app.delete("/api/admin/messages/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.messages = db.messages.filter(m => m.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message." });
  }
});

// 11. Social Links and Settings
app.put("/api/admin/socials", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.socials = { ...db.socials, ...req.body };
    await writeDB(db);
    res.json({ success: true, socials: db.socials });
  } catch (error) {
    res.status(500).json({ error: "Failed to update social links." });
  }
});

app.put("/api/admin/settings", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    db.settings = { ...db.settings, ...req.body };
    await writeDB(db);
    res.json({ success: true, settings: db.settings });
  } catch (error) {
    res.status(500).json({ error: "Failed to update site settings." });
  }
});

// 12. Full Visitor Analytics Summary
app.get("/api/admin/analytics", requireAdmin, async (req: Request, res: Response) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics summary." });
  }
});

// 13. Clear Analytics Logs
app.delete("/api/admin/analytics/clear", requireAdmin, async (req: Request, res: Response) => {
  try {
    await clearAnalytics();
    res.json({ success: true, message: "Analytics logs cleared successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear analytics logs." });
  }
});

// ==========================================
// VITE DEV SERVER & PRODUCTION SERVER ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", async (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio & CMS server is listening at http://localhost:${PORT}`);
  });
}

startServer();
