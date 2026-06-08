export interface Education {
  _id: string;
  degree: string;
  field: string;
  institution: string;
  location?: string;
  logoUrl?: string;
  gpa?: string;
  startDate: string;
  endDate?: string;
  highlights?: string[];
  order?: number;
}
