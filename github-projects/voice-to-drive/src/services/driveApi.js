/* global gapi, google */

export class DriveApiService {
  constructor() {
    this.accessToken = null;
    this.tokenClient = null;
    this.isInitialized = false;
  }

  async initialize(clientId, apiKey) {
    return new Promise((resolve, reject) => {
      // Wait for both gapi and google.accounts to be available
      const checkLibraries = setInterval(() => {
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined' && google.accounts) {
          clearInterval(checkLibraries);

          // Initialize gapi client for Drive API
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
              });

              // Initialize OAuth2 token client (new GIS library)
              this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (response) => {
                  if (response.error) {
                    console.error('Token error:', response);
                    return;
                  }
                  this.accessToken = response.access_token;
                  gapi.client.setToken({ access_token: this.accessToken });
                  console.log('Access token received');
                }
              });

              this.isInitialized = true;
              console.log('Google Drive API initialized successfully');
              resolve();
            } catch (error) {
              console.error('Failed to initialize Google Drive API:', error);
              reject(error);
            }
          });
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLibraries);
        reject(new Error('Timeout waiting for Google libraries'));
      }, 10000);
    });
  }

  async signIn() {
    return new Promise((resolve) => {
      if (!this.tokenClient) {
        console.error('Token client not initialized');
        resolve(false);
        return;
      }

      // Check if we already have a valid token
      const token = gapi.client.getToken();
      if (token && token.access_token) {
        this.accessToken = token.access_token;
        console.log('Already signed in');
        resolve(true);
        return;
      }

      // Request access token
      this.tokenClient.callback = (response) => {
        if (response.error) {
          console.error('Sign in failed:', response);
          resolve(false);
          return;
        }
        this.accessToken = response.access_token;
        gapi.client.setToken({ access_token: this.accessToken });
        console.log('Sign in successful');
        resolve(true);
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  isSignedIn() {
    const token = gapi.client.getToken();
    return token !== null && token.access_token !== null;
  }

  async ensureFolderPath(year, month, day) {
    // Create folder structure: recordings/YYYY/MM/DD
    const rootName = 'recordings';

    let rootId = await this.findOrCreateFolder(rootName, null);
    let yearId = await this.findOrCreateFolder(year, rootId);
    let monthId = await this.findOrCreateFolder(month, yearId);
    let dayId = await this.findOrCreateFolder(day, monthId);

    return dayId;
  }

  async findOrCreateFolder(name, parentId) {
    // Search for existing folder
    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const response = await gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // Create folder if not found
    const folderMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    };

    const folder = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });

    return folder.result.id;
  }

  async uploadFile(blob, fileName, folderId) {
    const metadata = {
      name: fileName,
      parents: [folderId]
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
