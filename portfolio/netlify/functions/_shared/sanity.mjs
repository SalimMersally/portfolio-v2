import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '46kdlm0d',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
});

export function fetchSanity(query, params = {}) {
  return client.fetch(query, params);
}

export const publishedPostCardQuery = `
  *[
    _type == "post" &&
    !(_id in path("drafts.**")) &&
    slug.current == $slug &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0] {
    title,
    tags,
    _updatedAt,
    "seriesTitle": series->title
  }
`;

export const publishedPostsQuery = `
  *[
    _type == "post" &&
    !(_id in path("drafts.**")) &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] | order(publishedAt desc) {
    "slug": slug.current,
    publishedAt,
    _updatedAt
  }
`;

export function getPublishedPost(slug) {
  return fetchSanity(publishedPostCardQuery, { slug });
}

export function getPublishedPosts() {
  return fetchSanity(publishedPostsQuery);
}
