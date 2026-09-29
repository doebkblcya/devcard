export type Theme = "white" | "black" | "apple" | "glass";

export interface Project {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}

export interface DeveloperProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string | null;
  location: string | null;
  followers: number;
  publicRepos: number;
  languages: string[];
  projects: Project[];
  profileUrl: string;
}
