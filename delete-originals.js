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
            if (['.jpg', '.jpeg', '.png'].includes(ext)) {
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

function deleteOriginals() {
    const publicDir = __dirname;
    const originals = getAllFiles(publicDir);

    let deletedCount = 0;
    let skippedCount = 0;
    const skippedFiles = [];

    console.log('\n========================================');
    console.log('DELETING ORIGINAL IMAGE FILES');
    console.log('========================================\n');
    console.log(`Found ${originals.length} original files to process\n`);

    originals.forEach(orig => {
        const webpPath = path.join(orig.dir, `${orig.basename}.webp`);
        const webpExists = fs.existsSync(webpPath);

        if (webpExists) {
            // WebP version exists, safe to delete original
            try {
                fs.unlinkSync(orig.path);
                console.log(`✓ Deleted: ${orig.path.replace(publicDir, '.')}`);
                deletedCount++;
            } catch (error) {
                console.log(`✗ Failed to delete: ${orig.path.replace(publicDir, '.')}`);
                console.log(`  Error: ${error.message}`);
            }
        } else {
            // No WebP version, skip (probably placeholder)
            console.log(`⊘ Skipped: ${orig.path.replace(publicDir, '.')} (no WebP version)`);
            skippedFiles.push(orig.path);
            skippedCount++;
        }
    });

    console.log(`\n========================================`);
    console.log(`DELETION COMPLETE`);
    console.log(`========================================`);
    console.log(`✓ Deleted:  ${deletedCount} files`);
    console.log(`⊘ Skipped:  ${skippedCount} files (no WebP version)`);
    console.log(`========================================\n`);

    if (skippedFiles.length > 0) {
        console.log(`Skipped files (placeholders or invalid):`);
        skippedFiles.forEach(f => console.log(`   ${f.replace(publicDir, '.')}`));
        console.log();
    }
}

deleteOriginals();
