export interface Project {
  _id: string;
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

export function validateProject(p: Project): boolean {
  return !!(
    p?._id &&
    p.title &&
    p.description &&
    p.date &&
    Array.isArray(p.techStack) &&
    p.order != null
  );
}
