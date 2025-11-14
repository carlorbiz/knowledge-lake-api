export class SyncManager {
  constructor(storageService, driveService) {
    this.storage = storageService;
    this.drive = driveService;
    this.isSyncing = false;
    this.syncQueue = [];
    this.syncInterval = null;
    this.onStatusChange = null;
  }

  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('Offline, skipping sync');
      return;
    }

    this.isSyncing = true;
    this.notifyStatusChange();

    try {
      const unsyncedRecordings = await this.storage.getUnsyncedRecordings();
      console.log(`Found ${unsyncedRecordings.length} recordings to sync`);

      for (const recording of unsyncedRecordings) {
        try {
          await this.syncRecording(recording);
        } catch (error) {
          console.error(`Failed to sync recording ${recording.id}:`, error);
          await this.storage.incrementRetryCount(recording.id);

          // Give up after 5 retries
          if (recording.retryCount >= 5) {
            console.error(`Recording ${recording.id} failed after 5 retries, keeping in queue`);
          }
        }
      }
    } finally {
      this.isSyncing = false;
      this.notifyStatusChange();
    }
  }

  async syncRecording(recording) {
    // Parse date from timestamp
    const date = new Date(recording.timestamp);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Ensure folder structure exists
    const folderId = await this.drive.ensureFolderPath(year, month, day);

    // Generate filename
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}-${minutes}-${seconds}`;
    const fileName = `${year}-${month}-${day}_${timeStr}.webm`;

    // Upload file
    await this.drive.uploadFile(recording.blob, fileName, folderId);

    // Mark as synced and delete from local storage
    await this.storage.markAsSynced(recording.id);
    await this.storage.deleteRecording(recording.id);

    console.log(`Successfully synced recording ${recording.id} as ${fileName}`);
  }

  startAutoSync(intervalMs = 30000) {
    // Auto-sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  setStatusChangeCallback(callback) {
    this.onStatusChange = callback;
  }

  async notifyStatusChange() {
    if (this.onStatusChange) {
      const pendingCount = await this.storage.getPendingCount();
      this.onStatusChange({
        syncing: this.isSyncing,
        pending: pendingCount
      });
    }
  }
}
