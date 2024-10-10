import * as fs from 'fs';
import * as path from 'path';

export const loadGoogleCredentials = (): string => {
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS;

    if (!credentialsBase64) {
        throw new Error('GOOGLE_CREDENTIALS environment variable is not set.');
    }

    // Decode the base64-encoded credentials and write them to a temporary file
    const credentialsPath = path.join(__dirname, 'credentials_g.json');
    fs.writeFileSync(credentialsPath, Buffer.from(credentialsBase64, 'base64'));

    return credentialsPath; // Return the path to the credentials file
};
