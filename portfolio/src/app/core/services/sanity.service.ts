import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';
import { Education } from '../models/education.model';
import { Experience } from '../models/experience.model';
import { Project } from '../models/project.model';
import { SiteSettings } from '../models/site-settings.model';
import { SkillGroup } from '../models/skill.model';
import { Theme } from '../models/theme.model';

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly client: SanityClient = createClient({
    projectId: environment.sanityProjectId,
    dataset: environment.sanityDataset,
    apiVersion: environment.sanityApiVersion,
    useCdn: true,
  });

  getSiteSettings(): Promise<SiteSettings> {
    return this.client.fetch<SiteSettings>(
      `*[_type == "siteSettings"][0] {
        name, title, tagline,
        "avatarUrl": avatar.asset->url,
        email, phone, location, github, linkedin,
        contactFormEnabled
      }`,
    );
  }

  getTheme(): Promise<Theme> {
    return this.client.fetch<Theme>(`*[_type == "theme"][0]`);
  }

  getExperiences(): Promise<Experience[]> {
    return this.client.fetch<Experience[]>(
      `*[_type == "experience"] | order(startDate desc) {
        _id, company, role, location,
        "logoUrl": logo.asset->url,
        startDate, endDate, current,
        bullets, technologies, order
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
      `*[_type == "education"] | order(startDate desc) {
        _id, degree, field, institution, location,
        "logoUrl": logo.asset->url,
        gpa, startDate, endDate, highlights, order
      }`,
    );
  }

  getProjects(): Promise<Project[]> {
    return this.client.fetch<Project[]>(
      `*[_type == "project"] | order(order asc) {
        _id, title, "slug": slug.current, description,
        "thumbnailUrl": thumbnail.asset->url,
        techStack, githubUrl, liveUrl, featured, order
      }`,
    );
  }

  getBooks(): Promise<Book[]> {
    return this.client.fetch<Book[]>(
      `*[_type == "book"] | order(order asc) {
        _id, title, author,
        "coverUrl": cover.asset->url,
        rating, note, status, finishedDate, order
      }`,
    );
  }
}
