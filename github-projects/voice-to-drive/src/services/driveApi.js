/* global gapi */

export class DriveApiService {
  constructor() {
    this.accessToken = null;
    this.isInitialized = false;
  }

  async initialize(clientId, apiKey) {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive.file'
          });

          this.isInitialized = true;
          console.log('Google Drive API initialized successfully');
          resolve();
        } catch (error) {
          console.error('Failed to initialize Google Drive API:', error);
          reject(error);
        }
      });
    });
  }

  async signIn() {
    const auth = gapi.auth2.getAuthInstance();
    if (auth.isSignedIn.get()) {
      this.accessToken = auth.currentUser.get().getAuthResponse().access_token;
      return true;
    }

    try {
      await auth.signIn();
      this.accessToken = auth.currentUser.get().getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  }

  isSignedIn() {
    try {
      const auth = gapi.auth2.getAuthInstance();
      return auth && auth.isSignedIn && auth.isSignedIn.get();
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
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
