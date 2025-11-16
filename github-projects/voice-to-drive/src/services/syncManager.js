export class SyncManager {
  constructor(storageService, driveService, transcriptionService = null) {
    this.storage = storageService;
    this.drive = driveService;
    this.transcription = transcriptionService;
    this.isSyncing = false;
    this.isTranscribing = false;
    this.syncQueue = [];
    this.syncInterval = null;
    this.transcriptionInterval = null;
    this.onStatusChange = null;
    this.uploadAudio = false; // Set to true to also upload audio files alongside transcripts
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

    // Generate base filename
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}-${minutes}-${seconds}`;
    const baseFileName = `${year}-${month}-${day}_${timeStr}`;

    // Upload transcript if available
    if (recording.transcribed && recording.transcript) {
      const transcriptBlob = new Blob([recording.transcript], { type: 'text/plain' });
      await this.drive.uploadFile(transcriptBlob, `${baseFileName}.txt`, folderId);
      console.log(`Uploaded transcript for recording ${recording.id}`);
    }

    // Upload audio if configured or if no transcript
    if (this.uploadAudio || !recording.transcribed) {
      await this.drive.uploadFile(recording.blob, `${baseFileName}.webm`, folderId);
      console.log(`Uploaded audio for recording ${recording.id}`);
    }

    // Mark as synced and delete from local storage
    await this.storage.markAsSynced(recording.id);
    await this.storage.deleteRecording(recording.id);

    console.log(`Successfully synced recording ${recording.id} as ${baseFileName}`);
  }

  // Transcription methods

  async transcribeAll() {
    if (!this.transcription || !this.transcription.isAvailable()) {
      console.log('Transcription service not available');
      return;
    }

    if (this.isTranscribing) {
      console.log('Transcription already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('Offline, skipping transcription');
      return;
    }

    this.isTranscribing = true;
    this.notifyStatusChange();

    try {
      const untranscribed = await this.storage.getUntranscribedRecordings();
      console.log(`Found ${untranscribed.length} recordings to transcribe`);

      for (const recording of untranscribed) {
        try {
          await this.transcribeRecording(recording);
        } catch (error) {
          console.error(`Failed to transcribe recording ${recording.id}:`, error);
          await this.storage.updateTranscriptionError(
            recording.id,
            error.error || error.message || 'Transcription failed'
          );
        }
      }
    } finally {
      this.isTranscribing = false;
      this.notifyStatusChange();
    }
  }

  async transcribeRecording(recording) {
    console.log(`Transcribing recording ${recording.id}...`);

    const result = await this.transcription.transcribeWithRetry(recording.blob);

    if (result.success && result.text) {
      await this.storage.updateTranscript(recording.id, result.text, {
        processingTime: result.processingTime,
        audioSize: result.audioSize,
        timestamp: result.timestamp,
      });
      console.log(`Successfully transcribed recording ${recording.id}`);
    } else {
      throw new Error(result.error || 'Transcription returned no text');
    }
  }

  startAutoSync(intervalMs = 30000) {
    // Auto-sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, intervalMs);

    // Auto-transcribe every 15 seconds (faster to get transcripts ready)
    if (this.transcription && this.transcription.isAvailable()) {
      this.transcriptionInterval = setInterval(() => {
        this.transcribeAll();
      }, intervalMs / 2);
    }
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
      this.transcriptionInterval = null;
    }
  }

  setUploadAudio(shouldUpload) {
    this.uploadAudio = shouldUpload;
    console.log(`Audio upload ${shouldUpload ? 'enabled' : 'disabled'}`);
  }

  setStatusChangeCallback(callback) {
    this.onStatusChange = callback;
  }

  async notifyStatusChange() {
    if (this.onStatusChange) {
      const pendingCount = await this.storage.getPendingCount();
      const untranscribed = this.transcription
        ? await this.storage.getUntranscribedRecordings()
        : [];

      this.onStatusChange({
        syncing: this.isSyncing,
        transcribing: this.isTranscribing,
        pending: pendingCount,
        untranscribed: untranscribed.length,
      });
    }
  }
}
