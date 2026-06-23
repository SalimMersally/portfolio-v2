import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../../environments/environment';
import { PortfolioData } from '../models/portfolio-data.model';

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly client: SanityClient = createClient({
    projectId: environment.sanityProjectId,
    dataset: environment.sanityDataset,
    apiVersion: environment.sanityApiVersion,
    useCdn: true,
  });

  getAllPortfolioData(): Promise<PortfolioData> {
    return this.client.fetch<PortfolioData>(`{
      "profile": *[_type == "profile"][0] {
        name, title, tagline,
        "cvUrl": cv.asset->url,
        email, phone, location, github, linkedin
      },
      "about": *[_type == "about"][0] {
        bio,
        highlights[] { value, label }
      },
      "experiences": *[_type == "experience"] | order(startDate desc) {
        _id, company, role, location,
        "logoUrl": logo.asset->url,
        startDate, endDate, current,
        bullets, technologies
      },
      "projects": *[_type == "project"] | order(order asc) {
        _id, title, description, date, techStack, githubUrl, liveUrl, order
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
      "books": *[_type == "book"] {
        _id, title, author,
        "coverUrl": cover.asset->url,
        status
      }
    }`);
  }
}
