export interface Experience {
  _id: string;
  company: string;
  role: string;
  location: string;
  logoUrl: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
  technologies: string[];
}

export function validateExperience(e: Experience): boolean {
  return !!(
    e?._id &&
    e.company &&
    e.role &&
    e.location &&
    e.logoUrl &&
    e.startDate &&
    e.current != null &&
    Array.isArray(e.bullets) &&
    e.bullets.length > 0 &&
    Array.isArray(e.technologies)
  );
}
