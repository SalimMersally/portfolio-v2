import { Book, validateBook } from './book.model';
import { Education, validateEducation } from './education.model';
import { Experience, validateExperience } from './experience.model';
import { Profile, validateProfile } from './profile.model';
import { Project, validateProject } from './project.model';
import { SkillGroup, validateSkillGroup } from './skill.model';

export interface PortfolioData {
  profile: Profile;
  experiences: Experience[];
  skills: SkillGroup[];
  education: Education[];
  projects: Project[];
  books: Book[];
}

export function validatePortfolioData(data: PortfolioData): boolean {
  if (!data) return false;
  if (!validateProfile(data.profile)) return false;
  if (!Array.isArray(data.experiences) || !data.experiences.every(validateExperience)) return false;
  if (!Array.isArray(data.skills) || !data.skills.every(validateSkillGroup)) return false;
  if (!Array.isArray(data.education) || !data.education.every(validateEducation)) return false;
  if (!Array.isArray(data.projects) || !data.projects.every(validateProject)) return false;
  if (!Array.isArray(data.books) || !data.books.every(validateBook)) return false;
  return true;
}
