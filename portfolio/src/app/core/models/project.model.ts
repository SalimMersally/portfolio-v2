export interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order?: number;
}
