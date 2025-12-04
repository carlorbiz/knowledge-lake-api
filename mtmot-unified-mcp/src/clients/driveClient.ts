import { google } from "googleapis";

const projectId = process.env.GOOGLE_PROJECT_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
let privateKey = process.env.GOOGLE_PRIVATE_KEY;

if (!clientEmail || !privateKey) {
  console.warn("[mtmot-mcp] Google service account env vars not fully set.");
}

if (privateKey) {
  // Handle escaped \n in environment variables
  privateKey = privateKey.replace(/\\n/g, "\n");
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: [
    "https://www.googleapis.com/auth/drive",           // Full read/write access
    "https://www.googleapis.com/auth/drive.file",      // Access to files created by this app
  ],
  subject: undefined,
});

export const drive = google.drive({
  version: "v3",
  auth,
});
