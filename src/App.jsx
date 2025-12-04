// ---------------- PART 1 of 4 ----------------
// src/App.jsx (part 1) — imports, globals, App start, repo fetch, theme, header
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";

/* ---------------- CONFIG ---------------- */
const GITHUB_USER = "GokulReddy28";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

// EmailJS credentials (you already created these)
const EMAILJS_SERVICE = "service_1b70yuk";
const EMAILJS_TEMPLATE = "template_v3cf3m9";
const EMAILJS_PUBLICKEY = "nz5aMvVJAtpFm3p-n";

// Contact / socials
const LINKEDIN = "https://www.linkedin.com/in/gokul-nanda-hv-677b8137a/";
const EMAIL_CONTACT = "ggokulnandahv@gmail.com";

/* --------------- Global Styles --------------- */
const GlobalStyles = () => (
  <style>{`
    @keyframes floatA { 0% { transform: translateY(0) translateX(0) } 50% { transform: translateY(-18px) translateX(12px) } 100% { transform: translateY(0) translateX(0) } }
    @keyframes floatB { 0% { transform: translateY(0) translateX(0) } 50% { transform: translateY(22px) translateX(-8px) } 100% { transform: translateY(0) translateX(0) } }

    .theme-fade { transition: background-color .45s ease, color .45s ease, filter .45s ease; }
    .modal-backdrop { backdrop-filter: blur(6px) saturate(1.05); -webkit-backdrop-filter: blur(6px) saturate(1.05); }

    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .lds-ring { display: inline-block; position: relative; width: 48px; height: 48px; }
    .lds-ring div { box-sizing: border-box; display: block; position: absolute; width: 40px; height: 40px; margin: 4px; border: 4px solid #7b45ff; border-radius: 50%; animation: lds-ring 1.2s cubic-bezier(.5,0,.5,1) infinite; border-color: #7b45ff transparent transparent transparent; }
    .lds-ring div:nth-child(1) { animation-delay: -0.45s; } .lds-ring div:nth-child(2) { animation-delay: -0.3s; } .lds-ring div:nth-child(3) { animation-delay: -0.15s; }
    @keyframes lds-ring { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .progress-bg { transition: width 120ms linear; height: 4px; }
  `}</style>
);

/* ---------------- App Component (start) ---------------- */
export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "dark"; } catch { return "dark"; }
  });

  // GitHub repos
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState(null);

  // project modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // UI loading overlay
  const [appLoading, setAppLoading] = useState(true);

  // visitor counter
  const [visitors, setVisitors] = useState(null);

  // scroll progress
  const [scrollPct, setScrollPct] = useState(0);

  /* Theme effect */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  /* Fetch GitHub repos (all public repos) */
  useEffect(() => {
    let mounted = true;
    async function loadRepos() {
      setReposLoading(true);
      try {
        const res = await fetch(GITHUB_API);
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setRepos(data.map(r => ({
          id: r.id,
          name: r.name,
          html_url: r.html_url,
          description: r.description,
          language: r.language,
          homepage: r.homepage,
          updated_at: r.updated_at,
          fork: r.fork
        })));
      } catch (err) {
        if (mounted) setReposError(err.message);
      } finally {
        if (mounted) setReposLoading(false);
      }
    }
    loadRepos();
    return () => { mounted = false; };
  }, []);

  /* Loading overlay logic — show until repos finish (short min delay) */
  useEffect(() => {
    const minMs = 700;
    const start = Date.now();
    (async () => {
      while (reposLoading) {
        if (Date.now() - start > 3500) break;
        await new Promise(r => setTimeout(r, 120));
      }
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minMs - elapsed);
      setTimeout(() => setAppLoading(false), wait);
    })();
  }, [reposLoading]);

  /* Scroll progress */
  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY || window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const pct = height > 0 ? Math.min(100, Math.round((scrolled / height) * 100)) : 0;
      setScrollPct(pct);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Visitor count (CountAPI fallback to localStorage) */
  useEffect(() => {
    const keyLocal = "gokul_portfolio_visits";
    (async () => {
      try {
        const res = await fetch("https://api.countapi.xyz/hit/gokul-portfolio.example.com/visits");
        if (res.ok) {
          const data = await res.json();
          setVisitors(data.value);
          return;
        }
      } catch (_) {}
      try {
        const current = Number(localStorage.getItem(keyLocal) || 0) + 1;
        localStorage.setItem(keyLocal, String(current));
        setVisitors(current);
      } catch {
        setVisitors(null);
      }
    })();
  }, []);
// ---------------- PART 2 of 4 ----------------
// src/App.jsx (part 2) — main layout: header, hero, about, projects, experience, skills

  /* ---------------- handlers (inside App scope) ---------------- */
  function openProjectModal(repo) {
    setSelectedProject(repo);
    setProjectModalOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeProjectModal() {
    setProjectModalOpen(false);
    setTimeout(() => setSelectedProject(null), 220);
  }

  /* ---------------- render (continuation of App) ---------------- */
  return (
    <div className={`min-h-screen theme-fade bg-gradient-to-b from-slate-900 to-[#050816] text-white ${theme === "light" ? "bg-white text-black" : ""}`}>
      <GlobalStyles />

      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full bg-black/10 h-1">
          <div className="progress-bg" style={{ width: `${scrollPct}%`, background: "linear-gradient(90deg,#7b45ff,#2fd3ff)", height: 4 }} />
        </div>
      </div>

      {/* Floating blobs */}
      <FloatingBlobs />

      {/* Loading overlay */}
      <AnimatePresence>
        {appLoading && (
          <motion.div key="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 flex items-center justify-center bg-black/75">
            <div className="text-center">
              <img src="/photo.jpg" alt="Gokul" className="w-36 h-36 rounded-xl object-cover mx-auto border border-white/10 shadow-2xl" />
              <div className="mt-4 text-xl font-semibold">Gokul Nanda HV</div>
              <div className="mt-4"><div className="lds-ring"><div></div><div></div><div></div><div></div></div></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Nav */}
      <header className="sticky top-0 z-40 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold">Gokul Nanda HV</div>
            <div className="hidden md:block text-sm text-gray-400">• Java • Automation • Android</div>
          </div>

          <div className="flex items-center gap-3">
            <a href="#about" className="hover:text-blue-300">About</a>
            <a href="#projects" className="hover:text-blue-300">Projects</a>
            <a href="#experience" className="hover:text-blue-300">Experience</a>
            <a href="#blogs" className="hover:text-blue-300">Blog</a>
            <a href="#contact" className="hover:text-blue-300">Contact</a>

            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="px-2 py-1 bg-white/10 rounded-md">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>

            <a href="/resume.pdf" className="ml-2 px-3 py-2 rounded-md bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black">Resume</a>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* HERO */}
        <section id="hero" className="text-center relative">
          <img src="/photo.jpg" alt="Gokul" className="w-48 h-48 rounded-xl mx-auto object-cover shadow-2xl border border-white/20" />
          <h1 className="mt-6 text-5xl font-extrabold">Gokul Nanda HV</h1>
          <div className="mt-3 text-xl text-gray-300"><TypewriterText /></div>
          <div className="absolute right-6 top-6 hidden md:block"><ThreeDAvatar /></div>

          <div className="mt-6 flex justify-center gap-3">
            <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="px-5 py-2 rounded-lg bg-white/10">GitHub</a>
            <a href={LINKEDIN} target="_blank" rel="noreferrer" className="px-5 py-2 rounded-lg border border-white/10">LinkedIn</a>
            <a href="#projects" className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black">View Projects</a>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mt-16">
          <h2 className="text-3xl font-semibold">About Me</h2>
          <p className="mt-4 text-gray-300 leading-relaxed">
            I am a results-driven Full Stack & QA Automation Engineer experienced in Java, Spring Boot,
            Selenium, Android and Python. I build scalable systems, robust automation suites, and
            production-quality mobile apps — with focus on reliability, testability and performance.
          </p>

          <div className="mt-4 text-sm text-gray-400">Visitors: {visitors ?? "—"}</div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="mt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-semibold">Projects</h2>
            <div className="text-sm text-gray-400">{reposLoading ? "Loading repos..." : `${repos.length} public repos`}</div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {reposError && <div className="col-span-3 text-red-400">Error: {reposError}</div>}
            {reposLoading && Array.from({length:3}).map((_,i)=>(<div key={i} className="p-4 bg-white/5 rounded-xl animate-pulse h-40" />))}
            {!reposLoading && repos.length === 0 && <div className="col-span-3 text-gray-400">No public repos found.</div>}
            {!reposLoading && repos.slice(0, 12).map(repo => (
              <motion.div key={repo.id} whileHover={{ y:-6 }} className="p-4 bg-white/10 rounded-xl">
                <ProjectCard repo={repo} onOpen={openProjectModal} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="mt-16">
          <h2 className="text-3xl font-semibold">Experience</h2>
          <div className="mt-6 space-y-4">
            <ExperienceCard
              title="Software Testing Intern — Robowaves"
              time="May 2025 – Present"
              desc={`• Built Selenium + Java automation suites and CI integrations.\n• Implemented Page Object Model and reusable helpers to speed tests.\n• Improved regression stability and reduced manual testing time.`}
            />
            <ExperienceCard
              title="AI Intern — Samsung Lab"
              time="Jun 2025"
              desc={`• Implemented preprocessing pipelines for healthcare models.\n• Optimized Python ETL scripts for performance and reliability.\n• Assisted in creating reproducible PoC ML demos.`}
            />
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="mt-16">
          <h2 className="text-3xl font-semibold">Skills</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Java","Spring Boot","Selenium","React","Android","Python","MySQL","Docker","Jenkins"].map(s=>(
              <span key={s} className="px-4 py-2 bg-white/10 rounded-full">{s}</span>
            ))}
          </div>
        </section>
// ---------------- PART 3 of 4 ----------------
// src/App.jsx (part 3) — timeline, certificates, blog, ContactSection (EmailJS)

        {/* TECH TIMELINE */}
        <TechTimeline />

        {/* CERTIFICATES */}
        <CertificatesSection />

        {/* BLOG (static examples) */}
        <section id="blogs" className="mt-16">
          <h2 className="text-3xl font-semibold">Blog</h2>
          <p className="text-gray-400 mt-2">Short engineering notes — click to read.</p>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <article className="p-4 bg-white/10 rounded-xl hover:scale-[1.02] transition cursor-pointer" onClick={() => alert("Open blog modal or integrate CMS")}>
              <div className="font-semibold">Designing Reliable Automation Frameworks</div>
              <div className="text-sm text-gray-400 mt-1">2025-05-20</div>
              <p className="mt-3 text-gray-300 line-clamp-3">Best practices, POM, CI integration and flaky test reduction...</p>
            </article>
            <article className="p-4 bg-white/10 rounded-xl hover:scale-[1.02] transition cursor-pointer" onClick={() => alert("Open blog modal or integrate CMS")}>
              <div className="font-semibold">Scaling Spring Boot Services</div>
              <div className="text-sm text-gray-400 mt-1">2024-11-12</div>
              <p className="mt-3 text-gray-300 line-clamp-3">Tips to design scalable microservices and reduce latency...</p>
            </article>
          </div>
        </section>

        {/* CONTACT — replace old contact with the ContactSection component */}
        <ContactSection />

      </main>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-400 py-6">© {new Date().getFullYear()} Gokul Nanda HV — Built with React & Tailwind</footer>

      {/* PROJECT MODAL */}
      <ProjectModal project={selectedProject} open={projectModalOpen} onClose={closeProjectModal} />

    </div>
  );
}
/* End of App component */
// ---------------- PART 4 of 4 ----------------
// src/App.jsx (part 4) — small components + modals + contact form

/* ---------------- small components ---------------- */

function TypewriterText() {
  const roles = ["Java Developer", "QA Automation Engineer", "Android Developer", "Full Stack Developer"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % roles.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.span key={roles[i]} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{roles[i]}</motion.span>
  );
}

function ThreeDAvatar() {
  return (
    <motion.div animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }} className="w-20 h-20">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="gA" x1="0" x2="1"><stop offset="0%" stopColor="#7b45ff" /><stop offset="100%" stopColor="#2fd3ff" /></linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#gA)" opacity="0.12" />
        <circle cx="50" cy="38" r="12" fill="#fff" opacity="0.14" />
        <rect x="32" y="56" width="36" height="26" rx="8" fill="#fff" opacity="0.08" />
      </svg>
    </motion.div>
  );
}

function FloatingBlobs() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      <div className="absolute -left-40 -top-40 w-[640px] h-[640px] rounded-full opacity-60" style={{ background: "radial-gradient(circle at 20% 20%, #b17cff, transparent 30%), radial-gradient(circle at 80% 80%, #2fd3ff, transparent 30%)", filter: "blur(60px)", animation: "floatA 12s ease-in-out infinite" }} />
      <div className="absolute right-[-150px] top-10 w-[520px] h-[520px] rounded-full opacity-60" style={{ background: "radial-gradient(circle at 20% 20%, #7b45ff, transparent 30%), radial-gradient(circle at 80% 80%, #00d4ff, transparent 30%)", filter: "blur(50px)", animation: "floatB 10s ease-in-out infinite" }} />
    </div>
  );
}

function ProjectCard({ repo, onOpen }) {
  const img = `/projects/${repo.name.toLowerCase()}.png`;
  return (
    <div>
      <div className="h-36 rounded-lg overflow-hidden bg-white/5 cursor-pointer" onClick={() => onOpen(repo)}>
        <img src={img} alt={repo.name} onError={(e) => (e.currentTarget.src = "/projects/placeholder.png")} className="w-full h-full object-cover" />
      </div>

      <div className="mt-2 font-semibold">{repo.name}</div>
      <div className="text-sm text-gray-300 mt-1 line-clamp-3">{repo.description}</div>

      <div className="mt-3 flex gap-2">
        <button onClick={() => onOpen(repo)} className="px-3 py-2 rounded-md bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black text-sm">Preview</button>
        <a href={repo.html_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md border border-white/10 text-sm">Code</a>
      </div>
    </div>
  );
}

function ExperienceCard({ title, time, desc }) {
  return (
    <motion.div whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }} className="p-5 bg-white/10 rounded-xl border border-white/10">
      <div className="flex justify-between items-start">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-400">{time}</div>
      </div>
      <p className="mt-3 text-gray-300 text-sm whitespace-pre-line">{desc}</p>
    </motion.div>
  );
}

function TechTimeline() {
  const items = ["Java","Spring Boot","Selenium","React","Android","MySQL","Docker","Jenkins"];
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-semibold">Tech Stack Timeline</h2>
      <div className="relative mt-8 border-l border-white/10 pl-6">
        {items.map((tech, i) => (
          <motion.div key={tech} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="mb-6 flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff]" />
            <div className="text-gray-300">{tech}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CertificatesSection() {
  const certs = [
    { id: 1, title: "Robowaves Internship", sub: "Automation & Selenium", file: "/certs/robowaves.pdf" },
    { id: 2, title: "Samsung AI Internship", sub: "Healthcare AI", file: "/certs/samsung.pdf" },
    { id: 3, title: "Java Full Stack Course", sub: "Course Completion", file: "/certs/java.pdf" }
  ];
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-semibold">Certificates & Achievements</h2>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {certs.map(c => (
          <a key={c.id} href={c.file} target="_blank" rel="noreferrer" className="p-4 bg-white/10 rounded-xl border border-white/10 hover:scale-[1.02] transition">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-gray-400 mt-1">{c.sub}</div>
            <div className="mt-3 text-xs text-blue-300">View certificate</div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Project Modal ---------------- */
function ProjectModal({ project, open, onClose }) {
  if (!open || !project) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 modal-backdrop" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-4xl w-full mx-4 p-6 bg-[#081226] rounded-2xl border border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-md bg-white/10">✕</button>
        <h3 className="text-2xl font-semibold">{project.name}</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <img src={`/projects/${project.name.toLowerCase()}.png`} onError={(e) => (e.currentTarget.src = "/projects/placeholder.png")} className="w-full h-64 object-cover rounded-lg border border-white/10" alt={project.name} />
          <div>
            <p className="text-gray-300">{project.description || "No description provided."}</p>
            <div className="mt-4 flex gap-3">
              <a href={project.html_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black rounded-md">GitHub</a>
              {project.homepage && <a href={project.homepage} target="_blank" rel="noreferrer" className="px-4 py-2 border border-white/10 rounded-md">Live</a>}
            </div>
            <p className="mt-4 text-sm text-gray-400">Updated: {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "Unknown"}</p>
            <p className="mt-2 text-xs text-gray-500">Fork: {project.fork ? "Yes" : "No"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- ContactSection (EmailJS) ---------------- */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

    emailjs
      .send(
        EMAILJS_SERVICE,       // service ID
        EMAILJS_TEMPLATE,      // template ID
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message
        },
        EMAILJS_PUBLICKEY      // public key
      )
      .then(() => {
        setStatus("Message sent successfully — I'll respond soon.");
        setForm({ name: "", email: "", message: "" });
        setSending(false);
      })
      .catch((err) => {
        console.error("EmailJS error:", err);
        setStatus("Failed to send message. Please try again later.");
        setSending(false);
      });
  };

  return (
    <section id="contact" className="mt-16 mb-24">
      <h2 className="text-3xl font-semibold">Contact Me</h2>
      <p className="text-gray-400 mt-2">I usually respond within a few hours.</p>

      <form onSubmit={handleSend} className="mt-6 max-w-xl space-y-4">
        <input
          required
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
        />

        <input
          required
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
        />

        <textarea
          required
          rows={5}
          placeholder="Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
        />

        <button type="submit" disabled={sending} className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black font-semibold w-full disabled:opacity-50">
          {sending ? "Sending..." : "Send Message"}
        </button>

        {status && <p className="text-sm mt-2 text-green-300">{status}</p>}
      </form>
    </section>
  );
}
