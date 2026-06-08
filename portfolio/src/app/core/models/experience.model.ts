export interface Experience {
  _id: string;
  company: string;
  role: string;
  location?: string;
  logoUrl?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
  technologies?: string[];
  order?: number;
}
