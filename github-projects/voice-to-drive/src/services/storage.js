import { openDB } from 'idb';

const DB_NAME = 'voice-recordings';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

export class StorageService {
  constructor() {
    this.db = null;
  }

  async initialize() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('synced', 'synced');
        }
      },
    });
  }

  async saveRecording(blob, metadata) {
    const recording = {
      blob,
      timestamp: new Date().toISOString(),
      synced: false,
      fileName: metadata.fileName,
      drivePath: metadata.drivePath,
      retryCount: 0,
      ...metadata
    };

    const id = await this.db.add(STORE_NAME, recording);
    console.log('Recording saved to IndexedDB, id:', id);
    return id;
  }

  async getUnsyncedRecordings() {
    const tx = this.db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('synced');
    return await index.getAll(false);
  }

  async markAsSynced(id) {
    const recording = await this.db.get(STORE_NAME, id);
    if (recording) {
      recording.synced = true;
      recording.syncedAt = new Date().toISOString();
      await this.db.put(STORE_NAME, recording);
    }
  }

  async deleteRecording(id) {
    await this.db.delete(STORE_NAME, id);
  }

  async incrementRetryCount(id) {
    const recording = await this.db.get(STORE_NAME, id);
    if (recording) {
      recording.retryCount = (recording.retryCount || 0) + 1;
      recording.lastRetry = new Date().toISOString();
      await this.db.put(STORE_NAME, recording);
    }
  }

  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return await navigator.storage.estimate();
    }
    return null;
  }

  async getPendingCount() {
    const unsynced = await this.getUnsyncedRecordings();
    return unsynced.length;
  }
}
