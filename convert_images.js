const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'public/images');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'MANIFEST.json');

// Recursively find files
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

async function convert() {
  console.log("==========================================");
  console.log("🖼️ BATCH IMAGES CONVERSION: JPG -> WEBP");
  console.log("==========================================");

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Images directory does not exist:", IMAGES_DIR);
    return;
  }

  const allFiles = getFiles(IMAGES_DIR);
  const jpgFiles = allFiles.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

  console.log(`Found ${jpgFiles.length} JPG files to convert.`);

  let successCount = 0;
  let failCount = 0;

  for (const jpgPath of jpgFiles) {
    const webpPath = jpgPath.replace(/\.jpe?g$/, '.webp');
    try {
      // Convert to WebP using Sharp
      await sharp(jpgPath)
        .webp({ quality: 80 }) // 80% quality visually lossless
        .toFile(webpPath);
      
      // Delete original JPG
      fs.unlinkSync(jpgPath);
      console.log(`✓ Converted: ${path.relative(IMAGES_DIR, jpgPath)} -> ${path.relative(IMAGES_DIR, webpPath)}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed converting ${path.relative(IMAGES_DIR, jpgPath)}:`, err.message);
      failCount++;
    }
  }

  // Update MANIFEST.json
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      let content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      // Replace all occurrences of .jpg with .webp
      content = content.replace(/\.jpg/g, '.webp');
      content = content.replace(/\.jpeg/g, '.webp');
      fs.writeFileSync(MANIFEST_PATH, content, 'utf-8');
      console.log("✓ MANIFEST.json updated successfully (replaced .jpg/.jpeg references with .webp).");
    } catch (err) {
      console.error("❌ Failed updating MANIFEST.json:", err.message);
    }
  }

  console.log("==========================================");
  console.log(`🏁 BATCH CONVERSION COMPLETED`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
  console.log("==========================================");
}

convert();
