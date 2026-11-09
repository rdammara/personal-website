import { readContent } from './content';

export type Project = {
  id: number;
  title: string; // The repo name
  description: string;
  url: string;
  homepageUrl: string | null;
  language: string | null;
  updatedAt: string; // Last push to the repo
};

// GitHub repos tagged "portfolio", most recently pushed first
export async function getProjects(take?: number) {
  const projects = readContent<Project[]>('projects.json');
  return take ? projects.slice(0, take) : projects;
}
