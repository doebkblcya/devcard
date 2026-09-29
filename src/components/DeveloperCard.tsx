import { ArrowUpRight, Github, MapPin, Star } from "lucide-react";
import { forwardRef } from "react";
import type { DeveloperProfile, Theme } from "../types";

interface Props {
  profile: DeveloperProfile;
  theme: Theme;
  sample?: boolean;
}

const number = new Intl.NumberFormat("en-US");

const DeveloperCard = forwardRef<HTMLDivElement, Props>(function DeveloperCard(
  { profile, theme, sample = false },
  ref,
) {
  return (
    <div ref={ref} className={`developer-card theme-${theme}`}>
      <div className="card-ambient ambient-one" />
      <div className="card-ambient ambient-two" />
      <div className="card-ambient ambient-three" />
      <div className="card-grain" />

      <div className="card-content">
        <header className="card-header">
          <span className="card-brand"><span className="brand-mark">D<span>.</span></span> DEVCARD</span>
          <span className="card-edition">THE DEVELOPER EDITION <span>— 001</span></span>
        </header>

        <section className="card-identity">
          <div className="avatar-frame">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" crossOrigin="anonymous" />
            ) : (
              <span className="avatar-initials">{profile.name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="identity-copy">
            <span className="identity-eyebrow">HELLO, I'M</span>
            <h2>{profile.name}</h2>
            <p className="card-handle">@{profile.username}</p>
          </div>
        </section>

        <div className="identity-details">
          {profile.bio && <p className="card-bio">{profile.bio}</p>}
          {profile.location && (
            <p className="card-location"><MapPin size={16} strokeWidth={1.8} />{profile.location}</p>
          )}
          {profile.languages.length > 0 && (
            <div className="language-list">
              {profile.languages.map((language) => <span key={language}>{language}</span>)}
            </div>
          )}
        </div>

        <section className="projects-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SELECTED WORK</span>
              <h3>Featured projects<span className="heading-dot">.</span></h3>
            </div>
            <span className="section-count">0{profile.projects.length} / 03</span>
          </div>
          <div className="project-list">
            {profile.projects.length ? profile.projects.map((project, index) => (
              <div className="project-row" key={project.url}>
                <span className="project-number">0{index + 1}</span>
                <div className="project-main">
                  <div className="project-topline">
                    <strong>{project.name}</strong>
                    <span className="project-stars"><Star size={15} fill="currentColor" strokeWidth={1.5} />{number.format(project.stars)}</span>
                  </div>
                  {project.description && <p className="project-description">{project.description}</p>}
                  {project.language && <span className="project-language"><i />{project.language}</span>}
                </div>
                <ArrowUpRight className="project-arrow" size={17} strokeWidth={1.6} />
              </div>
            )) : (
              <div className="project-empty">No public projects yet. The next one starts here.</div>
            )}
          </div>
        </section>

        <footer className="card-footer">
          <div className="card-stats">
            <div><strong>{number.format(profile.publicRepos)}</strong><span>REPOSITORIES</span></div>
            <div><strong>{number.format(profile.followers)}</strong><span>FOLLOWERS</span></div>
          </div>
          <div className="card-bottom">
            <span><Github size={16} strokeWidth={1.7} /> github.com/{profile.username}</span>
            <span className="card-bottom-mark">BUILT WITH DEVCARD <ArrowUpRight size={14} /></span>
          </div>
        </footer>
      </div>
      {sample && <div className="sample-ribbon">SAMPLE PREVIEW</div>}
    </div>
  );
});

export default DeveloperCard;
