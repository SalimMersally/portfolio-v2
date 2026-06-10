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
  credentialUrl: string;
  order: number;

  // optional metadata
  endDate?: string;
}
