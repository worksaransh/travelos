import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

export async function POST() {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");
    const manifestPath = path.join(imagesDir, "MANIFEST.json");

    const allFiles = getFilesRecursively(imagesDir);
    const jpgFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === ".jpg" || ext === ".jpeg";
    });

    let convertedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const file of jpgFiles) {
      try {
        const webpPath = file.substring(0, file.lastIndexOf(".")) + ".webp";
        
        // Run sharp compression
        await sharp(file)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        // Remove original file
        fs.unlinkSync(file);
        convertedCount++;
      } catch (err: any) {
        console.error(`Failed to compress ${file}:`, err);
        failedCount++;
        errors.push(`${path.basename(file)}: ${err.message}`);
      }
    }

    // Update MANIFEST.json if it exists
    if (fs.existsSync(manifestPath)) {
      let manifestContent = fs.readFileSync(manifestPath, "utf8");
      // Replace all .jpg / .jpeg extensions with .webp in manifest
      manifestContent = manifestContent.replace(/\.jpe?g/gi, ".webp");
      fs.writeFileSync(manifestPath, manifestContent, "utf8");
    }

    return NextResponse.json({
      success: true,
      converted: convertedCount,
      failed: failedCount,
      errors
    });
  } catch (error: any) {
    console.error("WebP Batch compression failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
