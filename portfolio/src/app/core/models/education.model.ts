export interface Education {
  _id: string;
  type: 'university' | 'bootcamp';
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  highlights: string[];

  // differs between university and bootcamp
  field?: string;
  gpa?: string;
  technologies?: string[];

  logoUrl: string;
  credentialUrl?: string;
  order: number;

  // optional metadata
  endDate?: string;
}

export function validateEducation(e: Education): boolean {
  return !!(
    e?._id &&
    e.type &&
    e.degree &&
    e.institution &&
    e.location &&
    e.startDate &&
    e.logoUrl &&
    Array.isArray(e.highlights) &&
    e.order != null
  );
}
