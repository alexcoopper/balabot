const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const loadGoogleCredentials = () => {
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS;

    if (!credentialsBase64) {
        throw new Error('GOOGLE_CREDENTIALS environment variable is not set.');
    }

    // Define the output path in the 'dist' folder
    const distDir = path.resolve(__dirname, '../dist');
    const credentialsPath = path.join(distDir, 'credentials_g.json');

    try {
        // Ensure the dist directory exists
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }

        // Write the credentials to the 'dist' folder
        fs.writeFileSync(credentialsPath, Buffer.from(credentialsBase64, 'base64'));
        console.log('Credentials written to', credentialsPath);
    } catch (error) {
        console.error('Error writing credentials:', error);
        process.exit(1); // Exit with an error code
    }
};

// Call the function to write the credentials
loadGoogleCredentials();
