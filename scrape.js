const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HANDLE = process.argv[2];
if (!HANDLE) {
  console.error('Usage: node scrape.js <handle>');
  process.exit(1);
}

const ASSETS_DIR = path.join(__dirname, 'assets', 'instagram');
fs.mkdirSync(ASSETS_DIR, { recursive: true });

async function downloadImage(page, url, filepath) {
  try {
    const resp = await page.context().request.get(url);
    if (resp.ok()) {
      const buffer = await resp.body();
      fs.writeFileSync(filepath, buffer);
      return true;
    }
  } catch (e) {
    console.error('Error downloading', url, e.message);
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1600 },
  });
  const page = await context.newPage();

  const result = {
    handle: HANDLE,
    name: null,
    bio: null,
    category: null,
    followers: null,
    following: null,
    posts: null,
    profilePicUrl: null,
    postImages: [],
    success: false,
    error: null,
  };

  try {
    await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try meta tags first (most reliable)
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content').catch(() => null);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);

    if (ogDescription) {
      // Format: "X Followers, Y Following, Z Posts - bio text"
      const match = ogDescription.match(/([\d,.\skKmM]+)\s*Followers,\s*([\d,.\skKmM]+)\s*Following,\s*([\d,.\skKmM]+)\s*Posts\s*-\s*(.*)/i);
      if (match) {
        result.followers = match[1].trim();
        result.following = match[2].trim();
        result.posts = match[3].trim();
        result.bio = match[4].trim();
      } else {
        result.bio = ogDescription;
      }
    }
    if (ogTitle) {
      result.name = ogTitle.replace(/\(@.*?\).*$/, '').trim();
    }
    if (ogImage) {
      result.profilePicUrl = ogImage;
      await downloadImage(page, ogImage, path.join(ASSETS_DIR, 'profile.jpg'));
    }

    // Try to grab post images from the grid
    const imgSrcs = await page.$$eval('img', imgs =>
      imgs.map(img => img.src).filter(src => src && src.includes('instagram'))
    );
    const filtered = [...new Set(imgSrcs)].filter(src => !src.includes('s150x150') && src !== ogImage).slice(0, 12);
    result.postImages = filtered;

    let i = 1;
    for (const src of filtered) {
      const ok = await downloadImage(page, src, path.join(ASSETS_DIR, `post-${i}.jpg`));
      if (ok) i++;
    }

    result.success = true;
  } catch (e) {
    result.error = e.message;
  }

  fs.writeFileSync(path.join(__dirname, 'scrape-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
