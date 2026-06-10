export interface Project {
  _id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  thumbnailUrl?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
}
