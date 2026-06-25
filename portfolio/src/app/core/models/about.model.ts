export interface AboutHighlight {
  value: string;
  label: string;
}

export interface About {
  photoUrl: string;
  bio: string;
  highlights: AboutHighlight[];
}

export function validateAbout(a: About): boolean {
  return !!(a?.photoUrl && a.bio && Array.isArray(a.highlights));
}
