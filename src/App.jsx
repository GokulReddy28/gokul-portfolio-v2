// src/App.jsx — PART 1 of 3
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";

/* ---------------- CONFIG ---------------- */
const GITHUB_USER = "GokulReddy28";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

// EmailJS credentials (your values)
const EMAILJS_SERVICE = "service_1b70yuk";
const EMAILJS_TEMPLATE = "template_v3cf3m9";
const EMAILJS_PUBLICKEY = "nz5aMvVJAtpFm3p-n";

const LINKEDIN = "https://www.linkedin.com/in/gokul-nanda-hv-677b8137a/";
const EMAIL_CONTACT = "ggokulnandahv@gmail.com";

/* --------------- small inline global styles --------------- */
const GlobalStyles = () => (
  <style>{`
    @keyframes floatA { 0% { transform: translateY(0) translateX(0) } 50% { transform: translateY(-18px) translateX(12px) } 100% { transform: translateY(0) translateX(0) } }
    @keyframes floatB { 0% { transform: translateY(0) translateX(0) } 50% { transform: translateY(22px) translateX(-8px) } 100% { transform: translateY(0) translateX(0) } }

    .theme-fade { transition: background-color .45s ease, color .45s ease, filter .45s ease; }
    .modal-backdrop { backdrop-filter: blur(6px) saturate(1.05); -webkit-backdrop-filter: blur(6px) saturate(1.05); }

    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .lds-ring { display: inline-block; position: relative; width: 48px; height: 48px; }
    .lds-ring div { box-sizing: border-box; position: absolute; width: 40px; height: 40px; margin: 4px; border: 4px solid #7b45ff; border-radius: 50%; animation: lds-ring 1.2s infinite linear; border-color: #7b45ff transparent transparent transparent; }
    .lds-ring div:nth-child(1) { animation-delay: -0.45s; } .lds-ring div:nth-child(2) { animation-delay: -0.3s; } .lds-ring div:nth-child(3) { animation-delay: -0.15s; }
    @keyframes lds-ring { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .progress-bg { transition: width 120ms linear; height: 4px; }
  `}</style>
);

/* ------------------ App (start) ------------------ */
export default function App() {
  // theme
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "dark"; } catch { return "dark"; }
  });

  // repos
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState(null);

  // modal & selection
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // UI
  const [appLoading, setAppLoading] = useState(true);
  const [visitors, setVisitors] = useState(null);
  const [scrollPct, setScrollPct] = useState(0);

  // apply theme to document
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  /* --------------- GitHub fetch logic (fixed + stable) --------------- */
const fetchRepos = useCallback(async () => {
  setReposLoading(true);
  setReposError(null);

  try {
   const res = await fetch(GITHUB_API, {
  headers: {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
  }
});



    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();

    const mapped = (data || []).map(r => ({
      id: r.id,
      name: r.name,
      html_url: r.html_url,
      description: r.description,
      language: r.language,
      homepage: r.homepage,
      updated_at: r.updated_at,
      fork: r.fork
    }));

    mapped.sort((a, b) =>
      (b.updated_at || "").localeCompare(a.updated_at || "")
    );

    setRepos(mapped);

  } catch (err) {
    setReposError(err.message);
  } finally {
    setReposLoading(false);
  }
}, []);


  // initial fetch + interval auto-refresh every 60s
  useEffect(() => {
    fetchRepos();
    const interval = setInterval(fetchRepos, 60_000); // 60 seconds
    return () => clearInterval(interval);
  }, [fetchRepos]);

  // min loader
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

  // scroll progress
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

  // visitor count (CountAPI fallback to local)
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
// src/App.jsx — PART 2 of 3 (continues)
  // handlers (open/close modal)
  function openProjectModal(repo) {
    setSelectedProject(repo);
    setProjectModalOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeProjectModal() {
    setProjectModalOpen(false);
    setTimeout(() => setSelectedProject(null), 220);
  }

  return (
    <div className={`min-h-screen theme-fade bg-gradient-to-b from-slate-900 to-[#050816] text-white ${theme === "light" ? "text-slate-900 bg-white" : ""}`}>
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
      <header className="sticky top-0 z-40">
        <div className="backdrop-blur-md bg-white/3 dark:bg-black/40 border-b border-white/6 dark:border-black/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-lg md:text-xl font-bold tracking-wide">Gokul Nanda HV</div>
              <div className="hidden md:flex items-center gap-3 text-sm text-gray-300">
                <a href="#about" className="hover:text-white">About</a>
                <a href="#projects" className="hover:text-white">Projects</a>
                <a href="#skills" className="hover:text-white">Skills</a>
                <a href="#contact" className="hover:text-white">Contact</a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* GitHub button uses white text so it's visible on dark nav */}
              <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20">GitHub</a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded-md bg-white/5 hover:bg-white/7">LinkedIn</a>

              <button
                onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="ml-2 p-2 rounded-md bg-white/5 hover:bg-white/7"
                title="Toggle dark / light"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>

              <a href="/resume.pdf" className="ml-2 px-3 py-2 rounded-md bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black font-medium text-sm">Download Resume</a>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* HERO (Option A) */}
        <section id="hero" className="grid md:grid-cols-2 gap-8 items-center mt-6">
          {/* LEFT: text */}
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Hi, I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b17cff] to-[#2fd3ff]">Gokul Nanda HV</span>
            </h1>
            <p className="text-gray-300 max-w-xl">
              Java Full-Stack Developer • Test Automation Engineer • Android Developer.
              I build robust backend systems, dependable automation frameworks, and user-focused apps.
            </p>

            <div className="flex gap-3 flex-wrap">
              <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-lg bg-white/10 text-white font-semibold hover:scale-[1.02] transform transition">View GitHub</a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-lg border border-white/10 hover:bg-white/5">LinkedIn</a>
              <a href="#projects" className="px-5 py-3 rounded-lg bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black font-semibold">Featured Projects</a>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <div>📍 Bengaluru, India</div>
              <div>✉️ <a className="underline" href={`mailto:${EMAIL_CONTACT}`}>{EMAIL_CONTACT}</a></div>
            </div>
          </motion.div>

          {/* RIGHT: profile card (responsive, square image) */}
          <motion.div initial={{opacity:0, scale:.98}} animate={{opacity:1, scale:1}} transition={{duration:.6}} className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm p-4 rounded-3xl bg-white/5 border border-white/6 backdrop-blur-md shadow-2xl">
              <div className="rounded-2xl overflow-hidden border border-white/6 aspect-[4/4]">
                <img src="/photo.jpg" alt="Gokul" className="w-full h-full object-cover" />
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="w-20 h-20 p-2 rounded-xl bg-gradient-to-br from-[#2fd3ff]/20 to-[#b17cff]/20 border border-white/6 flex items-center justify-center">
                  <SvgAvatar />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Futuristic Avatar</div>
                  <div className="font-medium">Developer • Tester • Builder</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mt-12">
          <motion.div initial={{opacity:0, y:8}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="p-6 rounded-2xl bg-white/3 border border-white/6">
            <h2 className="text-2xl font-semibold">About Me</h2>
            <p className="mt-3 text-gray-300">
              Full Stack Developer & Test Automation Engineer experienced with Java, Spring Boot, Selenium, Android, and Python.
              I build production-ready systems focusing on reliability, testability and performance.
            </p>
          </motion.div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <div className="text-sm text-gray-400">{reposLoading ? "Loading repos..." : `${repos.length} public repos found`}</div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {reposError && <div className="col-span-3 text-red-400">Error fetching GitHub: {reposError}</div>}

            {reposLoading && (Array.from({length:3}).map((_,i)=>(<div key={i} className="p-4 bg-[#0f1720] rounded-xl animate-pulse h-40" />)))}

            {!reposLoading && repos.length === 0 && (<div className="col-span-3 text-gray-400">No public repos found — push projects to GitHub.</div>)}

            {!reposLoading && repos.slice(0,9).map(repo => (
              <motion.div key={repo.id} whileHover={{y:-6}} className="p-4 bg-[#111727] rounded-xl border border-white/6 group">
                <ProjectCard repo={repo} onOpen={openProjectModal} />
              </motion.div>
            ))}
          </div>

          {/* Note removed the extra tip line if you requested editing — but keep one helpful note */}
          <div className="mt-4 text-sm text-gray-400">Tip: add good README & screenshots to repos for recruiters.</div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="mt-12">
          <motion.h3 initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="text-2xl font-semibold">Skills</motion.h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Java","Spring Boot","Android","Selenium","Python","React","MySQL","Docker","Jenkins","Automation"].map(s=>(<span key={s} className="px-3 py-1 bg-white/5 rounded-full border border-white/6 text-sm">{s}</span>))}
          </div>
        </section>
// src/App.jsx — PART 3 of 3 (end of file)
        {/* EXPERIENCE */}
        <section className="mt-12">
          <h3 className="text-2xl font-semibold">Experience</h3>
          <div className="mt-4 space-y-4">
            <ExperienceCard title="Software Testing Intern — Robowaves" time="May 2025 – Present" desc="Built Selenium automation suites and improved regression reliability." />
            <ExperienceCard title="AI/ Python Intern — Samsung Lab" time="Jun 2025" desc="Worked on preprocessing and sample AI prototypes for healthcare." />
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="mt-12 mb-20">
          <h3 className="text-2xl font-semibold">Contact</h3>
          <div className="mt-4 md:flex md:gap-8">
            <div className="md:w-1/2 text-gray-300">
              <p>Email: <a href={`mailto:${EMAIL_CONTACT}`} className="text-blue-300 underline">{EMAIL_CONTACT}</a></p>
              <p className="mt-2">Location: Bengaluru, Karnataka, India</p>
              <div className="mt-4 flex gap-3">
                <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="underline text-blue-300">GitHub</a>
                <a href={LINKEDIN} target="_blank" rel="noreferrer" className="underline text-blue-300">LinkedIn</a>
              </div>
            </div>

            <div className="md:w-1/2 mt-6 md:mt-0">
              <ContactSection />
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">© {new Date().getFullYear()} Gokul Nanda HV — Built with React & Tailwind</footer>

      {/* project modal */}
      <ProjectModal project={selectedProject} open={projectModalOpen} onClose={closeProjectModal} />
    </div>
  );
}

/* ----------------- small subcomponents ----------------- */

function SvgAvatar(){
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="animate-float" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradA" x1="0" x2="1">
          <stop offset="0%" stopColor="#b17cff"/>
          <stop offset="100%" stopColor="#2fd3ff"/>
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="30" fill="url(#gradA)" opacity="0.08" stroke="url(#gradA)" strokeWidth="1.5"/>
      <g transform="translate(0,0)">
        <ellipse cx="32" cy="36" rx="11" ry="8" fill="#ffffff" opacity="0.06"/>
        <rect x="22" y="18" rx="5" ry="5" width="20" height="18" fill="url(#gradA)" opacity="0.18"/>
        <circle cx="32" cy="27" r="3" fill="#fff"/>
      </g>
    </svg>
  );
}

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

/* ---------------- 3D Avatar (single declaration only) ---------------- */
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
      <div className="absolute -right-[150px] top-10 w-[520px] h-[520px] rounded-full opacity-60" style={{ background: "radial-gradient(circle at 20% 20%, #7b45ff, transparent 30%), radial-gradient(circle at 80% 80%, #00d4ff, transparent 30%)", filter: "blur(50px)", animation: "floatB 10s ease-in-out infinite" }} />
    </div>
  );
}

function ProjectCard({repo, onOpen}) {
  const imgPath = `/projects/${repo.name.toLowerCase()}.png`;
  return (
    <div>
      <div className="h-36 rounded-lg overflow-hidden bg-gradient-to-br from-white/3 to-white/6 mb-3 flex items-center justify-center cursor-pointer" onClick={() => onOpen(repo)}>
        <img src={imgPath} alt={repo.name} onError={(e)=>{ e.currentTarget.src='/projects/placeholder.png'; }} className="w-full h-full object-cover" />
      </div>

      <div className="font-semibold">{repo.name}</div>
      <div className="text-sm text-gray-300 mt-1 line-clamp-3">{repo.description}</div>
      <div className="mt-3 flex gap-3">
        <a href={repo.html_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black text-sm">View Code</a>
        {repo.homepage ? <a href={repo.homepage} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md border border-white/6 text-sm">Live</a> : null}
      </div>
    </div>
  );
}

function ExperienceCard({title, time, desc}) {
  return (
    <div className="p-4 bg-[#0f1720] rounded-xl border border-white/6">
      <div className="flex justify-between items-start">
        <div className="font-semibold text-lg">{title}</div>
        <div className="text-sm text-gray-400">{time}</div>
      </div>
      <p className="text-gray-300 mt-2 text-sm">{desc}</p>
    </div>
  );
}

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

/* ---------------- CONTACT (EmailJS) ---------------- */
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
    <section id="contact-form" className="mt-0">
      <form onSubmit={handleSend} className="mt-6 max-w-xl space-y-4">
        <input required type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 rounded-lg bg-white/10 border border-white/20" />
        <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-3 rounded-lg bg-white/10 border border-white/20" />
        <textarea required rows={5} placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full p-3 rounded-lg bg-white/10 border border-white/20" />
        <button type="submit" disabled={sending} className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#7b45ff] to-[#2fd3ff] text-black font-semibold w-full">{sending ? "Sending..." : "Send Message"}</button>
        {status && <p className="text-sm mt-2 text-green-300">{status}</p>}
      </form>
    </section>
  );
}
