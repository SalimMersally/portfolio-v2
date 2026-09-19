import { InjectionToken } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../../environments/environment';

export const SANITY_CLIENT = new InjectionToken<SanityClient>('SANITY_CLIENT', {
  providedIn: 'root',
  factory: () =>
    createClient({
      projectId: environment.sanityProjectId,
      dataset: environment.sanityDataset,
      apiVersion: environment.sanityApiVersion,
      useCdn: true,
    }),
});
