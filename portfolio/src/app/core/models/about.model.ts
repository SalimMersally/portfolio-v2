export interface AboutHighlight {
  value: string;
  label: string;
}

export interface About {
  bio: string;
  highlights: AboutHighlight[];
}

export function validateAbout(a: About): boolean {
  return !!(a?.bio && Array.isArray(a.highlights));
}
