const suppliedOrigin = process.argv[2];
if (!suppliedOrigin) {
  throw new Error('Usage: npm run verify:rendered -- https://your-site.example');
}

const origin = suppliedOrigin.replace(/\/$/, '');

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function get(path, options) {
  const response = await fetch(`${origin}${path}`, options);
  const body = await response.text();
  return { response, body };
}

function verifyPage(path, result) {
  expect(result.response.status === 200, `${path} returned ${result.response.status}`);
  for (const marker of [
    'rel="canonical"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
  ]) {
    expect(result.body.includes(marker), `${path} is missing ${marker}`);
  }
  expect(/<main[\s>]/.test(result.body), `${path} has no rendered main content`);
}

for (const path of ['/', '/work', '/blog']) {
  verifyPage(path, await get(path));
}

const sitemap = await get('/sitemap.xml');
expect(sitemap.response.status === 200, `sitemap returned ${sitemap.response.status}`);
expect(
  sitemap.response.headers.get('content-type')?.includes('application/xml'),
  'sitemap is not XML',
);
const postUrl = sitemap.body.match(/<loc>([^<]+\/blog\/[^<]+)<\/loc>/)?.[1];
expect(postUrl, 'sitemap contains no blog post URL to verify');

const postPath = new URL(postUrl).pathname;
const post = await get(postPath);
expect(post.response.status === 200, `${postPath} returned ${post.response.status}`);
expect(post.body.includes('<article'), `${postPath} has no rendered article`);
expect(post.body.includes('BlogPosting'), `${postPath} has no BlogPosting JSON-LD`);
expect(post.body.includes('rel="canonical"'), `${postPath} has no canonical URL`);
const imageUrl = post.body.match(
  /property="og:image" content="([^"]*\/api\/og\/blog\/[^"]+)"/,
)?.[1];
expect(imageUrl, `${postPath} has no revisioned social image`);

const imageResponse = await fetch(imageUrl);
const image = Buffer.from(await imageResponse.arrayBuffer());
expect(imageResponse.status === 200, `social image returned ${imageResponse.status}`);
expect(imageResponse.headers.get('content-type')?.includes('image/png'), 'social image is not PNG');
expect(
  image.readUInt32BE(16) === 1200 && image.readUInt32BE(20) === 630,
  'social image is not 1200×630',
);

for (const path of ['/this-route-cannot-exist', '/blog/this-post-cannot-exist']) {
  const missing = await get(path);
  expect(missing.response.status === 404, `${path} did not return 404`);
  expect(missing.body.includes('noindex, nofollow'), `${path} is not noindex`);
}

for (const userAgent of ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot']) {
  const robots = await get('/robots.txt', { headers: { 'User-Agent': userAgent } });
  expect(robots.response.status === 200, `robots.txt unavailable to ${userAgent}`);
  expect(robots.body.includes('Sitemap:'), `robots.txt policy missing for ${userAgent}`);
}

console.log(`Rendered-site verification passed for ${origin}`);
