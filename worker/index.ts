import type { DeveloperProfile, Project } from "../src/types";

interface Env {
  GITHUB_TOKEN?: string;
}

interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  public_repos: number;
  html_url: string;
}

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  updated_at: string;
}

const API = "https://api.github.com";
const USERNAME = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function githubFetch(path: string, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevCard-Worker",
    "X-GitHub-Api-Version": "2026-03-10",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API}${path}`, { headers });
}

function githubError(response: Response): Response {
  if (response.status === 404) return json({ error: "GitHub user not found." }, 404);
  if (response.status === 403 || response.status === 429) {
    return json({ error: "GitHub's request limit was reached. Please try again later." }, 503);
  }
  return json({ error: "GitHub is unavailable right now. Please try again." }, 502);
}

function pickProjects(repos: GithubRepo[]): GithubRepo[] {
  const owned = repos.filter((repo) => !repo.fork);
  const lowStars = owned.every((repo) => repo.stargazers_count <= 2);
  owned.sort((a, b) => {
    if (lowStars) {
      return Date.parse(b.updated_at) - Date.parse(a.updated_at) ||
        b.stargazers_count - a.stargazers_count;
    }
    return b.stargazers_count - a.stargazers_count ||
      Date.parse(b.updated_at) - Date.parse(a.updated_at);
  });
  return owned.slice(0, 3);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = /^\/api\/github\/([^/]+)$/.exec(url.pathname);
    if (!match || request.method !== "GET") return json({ error: "Not found." }, 404);

    let username: string;
    try {
      username = decodeURIComponent(match[1]);
    } catch {
      return json({ error: "Enter a valid GitHub username." }, 400);
    }
    if (!USERNAME.test(username)) return json({ error: "Enter a valid GitHub username." }, 400);

    try {
      const userResponse = await githubFetch(`/users/${username}`, env.GITHUB_TOKEN);
      if (!userResponse.ok) return githubError(userResponse);
      const user = await userResponse.json() as GithubUser;

      const repos: GithubRepo[] = [];
      // GitHub does not support sorting this endpoint by stars. Read the owned
      // public repositories and rank them after filtering forks.
      for (let page = 1; page <= 20; page++) {
        const response = await githubFetch(
          `/users/${username}/repos?type=owner&per_page=100&page=${page}`,
          env.GITHUB_TOKEN,
        );
        if (!response.ok) return githubError(response);
        const batch = await response.json() as GithubRepo[];
        repos.push(...batch);
        if (batch.length < 100) break;
      }

      const featured = pickProjects(repos);
      const projects: Project[] = featured.map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
      }));
      const profile: DeveloperProfile = {
        name: user.name?.trim() || user.login,
        username: user.login,
        avatar: user.avatar_url,
        bio: user.bio?.trim() || null,
        location: user.location?.trim() || null,
        followers: user.followers,
        publicRepos: user.public_repos,
        languages: [...new Set(featured.map((repo) => repo.language).filter((language): language is string => Boolean(language)))].slice(0, 3),
        projects,
        profileUrl: user.html_url,
      };
      return json(profile);
    } catch {
      return json({ error: "Couldn't reach GitHub. Please try again." }, 502);
    }
  },
};
