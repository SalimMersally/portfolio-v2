import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';
import { Education } from '../models/education.model';
import { Experience } from '../models/experience.model';
import { PortfolioData } from '../models/portfolio-data.model';
import { Profile } from '../models/profile.model';
import { Project } from '../models/project.model';
import { SkillGroup } from '../models/skill.model';

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly client: SanityClient = createClient({
    projectId: environment.sanityProjectId,
    dataset: environment.sanityDataset,
    apiVersion: environment.sanityApiVersion,
    useCdn: true,
  });

  getProfile(): Promise<Profile> {
    return this.client.fetch<Profile>(
      `*[_type == "profile"][0] {
        name, title, tagline,
        "cvUrl": cv.asset->url,
        email, phone, location, github, linkedin
      }`,
    );
  }

  getExperiences(): Promise<Experience[]> {
    return this.client.fetch<Experience[]>(
      `*[_type == "experience"] | order(startDate desc) {
        _id, company, role, location,
        "logoUrl": logo.asset->url,
        startDate, endDate, current,
        bullets, technologies
      }`,
    );
  }

  getSkills(): Promise<SkillGroup[]> {
    return this.client.fetch<SkillGroup[]>(
      `*[_type == "skill"] | order(order asc) {
        _id, category, items, order
      }`,
    );
  }

  getEducation(): Promise<Education[]> {
    return this.client.fetch<Education[]>(
      `*[_type == "education"] | order(order asc) {
        _id, type, degree, field, institution, location,
        "logoUrl": logo.asset->url,
        "credentialUrl": credential.asset->url,
        gpa, startDate, endDate, highlights, technologies, order
      }`,
    );
  }

  getProjects(): Promise<Project[]> {
    return this.client.fetch<Project[]>(
      `*[_type == "project"] | order(order asc) {
        _id, title, description, date, techStack, githubUrl, liveUrl, order
      }`,
    );
  }

  getBooks(): Promise<Book[]> {
    return this.client.fetch<Book[]>(
      `*[_type == "book"] {
        _id, title, author,
        "coverUrl": cover.asset->url,
        status
      }`,
    );
  }

  getAllPortfolioData(): Promise<PortfolioData> {
    return this.client.fetch<PortfolioData>(`{
      "profile": *[_type == "profile"][0] {
        name, title, tagline,
        "cvUrl": cv.asset->url,
        email, phone, location, github, linkedin
      },
      "experiences": *[_type == "experience"] | order(startDate desc) {
        _id, company, role, location,
        "logoUrl": logo.asset->url,
        startDate, endDate, current,
        bullets, technologies
      },
      "skills": *[_type == "skill"] | order(order asc) {
        _id, category, items, order
      },
      "education": *[_type == "education"] | order(order asc) {
        _id, type, degree, field, institution, location,
        "logoUrl": logo.asset->url,
        "credentialUrl": credential.asset->url,
        gpa, startDate, endDate, highlights, technologies, order
      },
      "projects": *[_type == "project"] | order(order asc) {
        _id, title, description, date, techStack, githubUrl, liveUrl, order
      },
      "books": *[_type == "book"] {
        _id, title, author,
        "coverUrl": cover.asset->url,
        status
      }
    }`);
  }
}
