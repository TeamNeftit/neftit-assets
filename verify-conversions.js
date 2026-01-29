const fs = require('fs');
const path = require('path');

// Function to recursively get all image files
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                fileList.push({
                    path: filePath,
                    ext: ext,
                    name: file,
                    basename: path.basename(file, ext),
                    dir: path.dirname(filePath)
                });
            }
        }
    });

    return fileList;
}

function verifyConversions() {
    const publicDir = __dirname;
    const allFiles = getAllFiles(publicDir);

    // Group by extension
    const jpgFiles = allFiles.filter(f => f.ext === '.jpg');
    const jpegFiles = allFiles.filter(f => f.ext === '.jpeg');
    const pngFiles = allFiles.filter(f => f.ext === '.png');
    const webpFiles = allFiles.filter(f => f.ext === '.webp');

    // Find originals without WebP versions
    const originals = [...jpgFiles, ...jpegFiles, ...pngFiles];
    const missingWebP = [];
    const hasWebP = [];

    originals.forEach(orig => {
        const webpPath = path.join(orig.dir, `${orig.basename}.webp`);
        const webpExists = fs.existsSync(webpPath);

        if (!webpExists) {
            // Check file size to see if it's a placeholder
            const stats = fs.statSync(orig.path);
            missingWebP.push({
                ...orig,
                size: stats.size
            });
        } else {
            hasWebP.push(orig);
        }
    });

    console.log('\n========================================');
    console.log('IMAGE CONVERSION VERIFICATION REPORT');
    console.log('========================================\n');

    console.log('📊 File Count Summary:');
    console.log(`   Total .jpg files:    ${jpgFiles.length}`);
    console.log(`   Total .jpeg files:   ${jpegFiles.length}`);
    console.log(`   Total .png files:    ${pngFiles.length}`);
    console.log(`   Total .webp files:   ${webpFiles.length}`);
    console.log(`   ─────────────────────────────`);
    console.log(`   Original files:      ${originals.length}`);
    console.log(`   ✅ Converted:        ${hasWebP.length}`);
    console.log(`   ❌ Not converted:    ${missingWebP.length}\n`);

    if (missingWebP.length > 0) {
        console.log('❌ Files WITHOUT WebP versions:');
        console.log('─────────────────────────────────────');
        missingWebP.forEach(f => {
            const sizeKB = (f.size / 1024).toFixed(2);
            const isPlaceholder = f.size < 100 ? ' (placeholder?)' : '';
            console.log(`   ${f.path.replace(publicDir, '.')}`);
            console.log(`      Size: ${f.size} bytes (${sizeKB} KB)${isPlaceholder}\n`);
        });
    }

    console.log('\n✅ IMPORTANT NOTE:');
    console.log('─────────────────────────────────────');
    console.log('The original JPG/JPEG/PNG files are STILL present.');
    console.log('This is BY DESIGN - we created .webp versions');
    console.log('without deleting the originals.\n');
    console.log('If you want to remove the original files and');
    console.log('only keep the .webp versions, please confirm.\n');
    console.log('========================================\n');
}

verifyConversions();
