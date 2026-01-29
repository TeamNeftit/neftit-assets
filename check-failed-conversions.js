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

// Function to check if file can be converted
async function checkFile(imagePath) {
    try {
        const dir = path.dirname(imagePath);
        const ext = path.extname(imagePath);
        const baseName = path.basename(imagePath, ext);
        const webpPath = path.join(dir, `${baseName}.webp`);

        // Check if WebP already exists
        const webpExists = fs.existsSync(webpPath);

        // Try to read the image metadata
        const metadata = await sharp(imagePath).metadata();

        return {
            path: imagePath,
            status: 'OK',
            webpExists,
            format: metadata.format,
            size: metadata.size,
            width: metadata.width,
            height: metadata.height
        };
    } catch (error) {
        return {
            path: imagePath,
            status: 'FAILED',
            error: error.message
        };
    }
}

// Main diagnostic function
async function diagnoseFiles() {
    const publicDir = __dirname;
    console.log(`Diagnosing images in: ${publicDir}\n`);

    const imageFiles = getAllImageFiles(publicDir);
    console.log(`Found ${imageFiles.length} source images\n`);

    const failedFiles = [];
    const missingWebP = [];

    for (const imagePath of imageFiles) {
        const result = await checkFile(imagePath);

        if (result.status === 'FAILED') {
            failedFiles.push(result);
            console.log(`❌ FAILED: ${imagePath}`);
            console.log(`   Error: ${result.error}\n`);
        } else if (!result.webpExists) {
            missingWebP.push(result);
            console.log(`⚠️  NO WEBP: ${imagePath}`);
            console.log(`   Format: ${result.format}, Size: ${result.width}x${result.height}\n`);
        }
    }

    console.log(`\n========================================`);
    console.log(`Diagnostic Results:`);
    console.log(`Total source images: ${imageFiles.length}`);
    console.log(`❌ Corrupted/Invalid files: ${failedFiles.length}`);
    console.log(`⚠️  Missing WebP conversions: ${missingWebP.length}`);
    console.log(`========================================\n`);

    if (failedFiles.length > 0) {
        console.log(`\nFiles that cannot be converted:`);
        failedFiles.forEach(f => {
            console.log(`  - ${f.path}`);
            console.log(`    Reason: ${f.error}`);
        });
    }

    if (missingWebP.length > 0) {
        console.log(`\nFiles missing WebP version:`);
        missingWebP.forEach(f => {
            console.log(`  - ${f.path}`);
        });
    }
}

// Run the diagnostic
diagnoseFiles().catch(console.error);
