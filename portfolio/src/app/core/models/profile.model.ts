export interface Profile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone?: string;
  location: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  contactIntro: string;
}

export function validateProfile(p: Profile): boolean {
  return !!(
    p?.name &&
    p.title &&
    p.tagline &&
    p.email &&
    p.location &&
    p.github &&
    p.linkedin &&
    p.cvUrl &&
    p.contactIntro
  );
}
