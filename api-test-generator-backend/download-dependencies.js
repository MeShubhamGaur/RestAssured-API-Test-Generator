/**
 * Simple script to download RestAssured dependencies
 * Run: node download-dependencies.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create libs directory if it doesn't exist
const libsDir = path.join(__dirname, 'libs');
if (!fs.existsSync(libsDir)) {
    fs.mkdirSync(libsDir);
    console.log('✓ Created libs directory');
}

// List of dependencies to download
const dependencies = [
    {
        name: 'RestAssured',
        url: 'https://repo1.maven.org/maven2/io/rest-assured/rest-assured/5.3.0/rest-assured-5.3.0.jar',
        filename: 'rest-assured-5.3.0.jar'
    },
    {
        name: 'Groovy',
        url: 'https://repo1.maven.org/maven2/org/apache/groovy/groovy/4.0.11/groovy-4.0.11.jar',
        filename: 'groovy-4.0.11.jar'
    },
    {
        name: 'Groovy XML',
        url: 'https://repo1.maven.org/maven2/org/apache/groovy/groovy-xml/4.0.11/groovy-xml-4.0.11.jar',
        filename: 'groovy-xml-4.0.11.jar'
    },
    {
        name: 'Hamcrest',
        url: 'https://repo1.maven.org/maven2/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar',
        filename: 'hamcrest-2.2.jar'
    },
    {
        name: 'TestNG',
        url: 'https://repo1.maven.org/maven2/org/testng/testng/7.7.1/testng-7.7.1.jar',
        filename: 'testng-7.7.1.jar'
    },
    {
        name: 'JCommander (TestNG dependency)',
        url: 'https://repo1.maven.org/maven2/com/beust/jcommander/1.82/jcommander-1.82.jar',
        filename: 'jcommander-1.82.jar'
    },
    {
        name: 'HTTP Builder',
        url: 'https://repo1.maven.org/maven2/io/rest-assured/rest-assured-common/5.3.0/rest-assured-common-5.3.0.jar',
        filename: 'rest-assured-common-5.3.0.jar'
    }
];

/**
 * Download a file from URL
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        
        https.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                file.close();
                fs.unlinkSync(destPath);
                return downloadFile(response.headers.location, destPath)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(destPath);
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
            
        }).on('error', (err) => {
            file.close();
            fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

/**
 * Main function
 */
async function downloadDependencies() {
    console.log('\n=================================');
    console.log('Downloading RestAssured Dependencies');
    console.log('=================================\n');
    
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const dep of dependencies) {
        const filePath = path.join(libsDir, dep.filename);
        
        // Check if already exists
        if (fs.existsSync(filePath)) {
            console.log(`⊘ ${dep.name} - Already exists`);
            skipped++;
            continue;
        }
        
        try {
            process.stdout.write(`⏳ Downloading ${dep.name}... `);
            await downloadFile(dep.url, filePath);
            console.log('✓ Done');
            downloaded++;
        } catch (error) {
            console.log(`✗ Failed: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\n=================================');
    console.log(`✓ Downloaded: ${downloaded}`);
    console.log(`⊘ Skipped: ${skipped}`);
    if (failed > 0) {
        console.log(`✗ Failed: ${failed}`);
    }
    console.log('=================================\n');
    
    if (downloaded > 0 || skipped === dependencies.length) {
        console.log('✓ All dependencies are ready!');
        console.log('You can now run: node server.js\n');
    } else {
        console.log('⚠ Some dependencies failed to download.');
        console.log('Please download them manually from Maven Central.\n');
    }
}

// Run the script
downloadDependencies().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});