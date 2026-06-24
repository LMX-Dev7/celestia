const sharp = require('sharp');
const path = require('path');

const ASSETS = path.join(__dirname, 'assets', 'instagram');
const SRC_LOGO = path.join(ASSETS, 'post-2.jpg');

(async () => {
  // 1. Crop the real gold moon+star mark from the "coming soon" post
  const logoCrop = await sharp(SRC_LOGO)
    .extract({ left: 258, top: 178, width: 145, height: 105 })
    .resize({ width: 400, height: 290, fit: 'fill' })
    .toBuffer();

  // 2. Composite it centered on a brand-black square to build clean favicons
  const SIZE = 512;
  const base = sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: '#1b1813' },
  });

  const logoResized = await sharp(logoCrop)
    .resize({ width: Math.round(SIZE * 0.62) })
    .toBuffer();
  const logoMeta = await sharp(logoResized).metadata();

  const composite = await base
    .composite([{
      input: logoResized,
      left: Math.round((SIZE - logoMeta.width) / 2),
      top: Math.round((SIZE - logoMeta.height) / 2),
    }])
    .png()
    .toBuffer();

  await sharp(composite).resize(32, 32).toFile(path.join(__dirname, 'favicon-32.png'));
  await sharp(composite).resize(16, 16).toFile(path.join(__dirname, 'favicon-16.png'));
  await sharp(composite).resize(180, 180).toFile(path.join(__dirname, 'apple-touch-icon.png'));

  // 3. OG/social share image from the real "coming soon" post (1200x630)
  await sharp(SRC_LOGO)
    .resize({ width: 1200 })
    .extract({ left: 0, top: 435, width: 1200, height: 630 })
    .jpeg({ quality: 85 })
    .toFile(path.join(__dirname, 'og-image.jpg'));

  console.log('done');
})();
