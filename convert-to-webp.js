const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to recursively get all image files
function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Function to convert image to WebP
async function convertToWebP(imagePath) {
  try {
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const webpPath = path.join(dir, `${baseName}.webp`);
    
    // Convert to WebP with high quality
    await sharp(imagePath)
      .webp({ quality: 90 })
      .toFile(webpPath);
    
    console.log(`✓ Converted: ${imagePath} -> ${webpPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to convert ${imagePath}:`, error.message);
    return false;
  }
}

// Main conversion function
async function convertAllImages() {
  const publicDir = __dirname;
  console.log(`Searching for images in: ${publicDir}\n`);
  
  const imageFiles = getAllImageFiles(publicDir);
  console.log(`Found ${imageFiles.length} images to convert\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const imagePath of imageFiles) {
    const success = await convertToWebP(imagePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Conversion Complete!`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`========================================`);
}

// Run the conversion
convertAllImages().catch(console.error);
