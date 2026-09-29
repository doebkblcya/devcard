import { ArrowDown, ArrowUpRight, Check, Download, Github, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import DeveloperCard from "./components/DeveloperCard";
import ThemeSelector from "./components/ThemeSelector";
import UserForm from "./components/UserForm";
import { exportImage } from "./lib/exportImage";
import type { DeveloperProfile, Theme } from "./types";

const sample: DeveloperProfile = {
  name: "Alex Rivera",
  username: "yourname",
  avatar: "",
  bio: "Crafting thoughtful software for a more human web.",
  location: "Somewhere on Earth",
  followers: 128,
  publicRepos: 24,
  languages: ["TypeScript", "Python", "CSS"],
  projects: [
    { name: "orbit-ui", description: "A small design system for big ideas.", stars: 248, language: "TypeScript", url: "sample-1" },
    { name: "tiny-tools", description: "Useful little things for the everyday developer.", stars: 92, language: "Python", url: "sample-2" },
    { name: "good-morning", description: "Start your day with a little more focus.", stars: 38, language: "CSS", url: "sample-3" },
  ],
  profileUrl: "",
};

const USERNAME = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

export default function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [theme, setTheme] = useState<Theme>("glass");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / 540));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function loadProfile(rawUsername: string) {
    const value = rawUsername.trim().replace(/^@/, "");
    if (!USERNAME.test(value)) {
      setError("Enter a valid GitHub username.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/github/${encodeURIComponent(value)}`, { signal: controller.signal });
      const data = await response.json() as DeveloperProfile | { error: string };
      if (!response.ok) throw new Error("error" in data ? data.error : "Something went wrong.");
      setProfile(data as DeveloperProfile);
      setUsername((data as DeveloperProfile).username);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadProfile(username);
  }

  async function download() {
    if (!cardRef.current || !profile || exporting) return;
    setExporting(true);
    setError("");
    try {
      await exportImage(cardRef.current, profile.username);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not export this card.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="site-shell">
      <div className="page-glow page-glow-one" />
      <div className="page-glow page-glow-two" />
      <header className="site-header">
        <a className="site-logo" href="/" aria-label="DevCard home"><span>D<span>.</span></span> devcard</a>
        <a className="header-github" href="https://github.com/doebkblcya/devcard" target="_blank" rel="noreferrer"><Github size={17} /> <span>View on GitHub</span><ArrowUpRight size={15} /></a>
      </header>

      <main className="main-grid">
        <div className="story-panel">
          <div className="story-top">
            <div className="eyebrow"><span className="eyebrow-line" /> THE DEVELOPER CARD STUDIO</div>
            <h1>Your GitHub.<br /><em>Beautifully</em> framed<span className="hero-period">.</span></h1>
            <p className="hero-description">More than a profile. A little piece of who you are, what you build, and where you're headed — all in one card.</p>
            <UserForm username={username} onUsernameChange={setUsername} onSubmit={generate} loading={loading} />
            {error && <p className="error-message" role="alert">{error}</p>}
            <button className="try-example" type="button" onClick={() => { setUsername("torvalds"); void loadProfile("torvalds"); }}>Need inspiration? <span>Try “torvalds” <ArrowUpRight size={14} /></span></button>
          </div>

          <div className="story-bottom">
            <div className="feature-line"><span><Check size={14} /></span> Four distinct looks. One effortless export.</div>
            <div className="feature-line"><span><Check size={14} /></span> Made from your public GitHub profile.</div>
            <div className="feature-line"><span><Check size={14} /></span> Ready for your phone, portfolio, or next hello.</div>
            <div className="story-scroll">YOUR WORK, AT A GLANCE <ArrowDown size={16} /></div>
          </div>
        </div>

        <section className="preview-panel" aria-label="Developer card preview">
          <div className="preview-topline"><span className="preview-live"><i /> LIVE PREVIEW</span><span>01 / 01</span></div>
          <div className="preview-stage">
            <div className="preview-noise" />
            <div className="preview-frame" ref={previewRef} style={{ height: `${960 * scale}px` }}>
              <div className="preview-scaled" style={{ transform: `scale(${scale})`, left: `calc(50% - ${270 * scale}px)` }}>
                <DeveloperCard ref={cardRef} profile={profile || sample} theme={theme} sample={!profile} />
              </div>
            </div>
          </div>
          <div className="preview-controls">
            <div className="controls-title"><div><Sparkles size={16} /><span>MAKE IT YOURS</span></div><span>CHOOSE A FINISH</span></div>
            <ThemeSelector theme={theme} onChange={setTheme} />
            <button className="download-button" type="button" onClick={download} disabled={!profile || exporting}>
              {exporting ? <LoaderCircle className="spin" size={18} /> : <Download size={18} />}
              {exporting ? "Preparing PNG..." : "Download PNG"}
              <span>1080 × 1920 <ArrowUpRight size={16} /></span>
            </button>
            {!profile && <p className="download-hint">Enter a GitHub username to download your card.</p>}
          </div>
        </section>
      </main>

      <footer className="site-footer"><span>DEVCARD © 2026</span><span>BUILT FOR BUILDERS, EVERYWHERE.</span><span>NO ACCOUNT. JUST YOU.</span></footer>
    </div>
  );
}
