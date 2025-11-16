import { useState, useEffect } from 'react';
import SessionControl from './components/SessionControl';
import StatusIndicator from './components/StatusIndicator';
import { VADService } from './services/vad';
import { AudioRecorderService } from './services/recorder';
import { StorageService } from './services/storage';
import { DriveApiService } from './services/driveApi';
import { SyncManager } from './services/syncManager';
import { TranscriptionService } from './services/transcription';
import './App.css';

/* global gapi */

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, syncing: false });
  const [online, setOnline] = useState(navigator.onLine);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Services (initialize once)
  const [services, setServices] = useState(null);

  useEffect(() => {
    console.log('🚀 App mounted - starting initialization...');
    initializeServices();

    // Listen for online/offline events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function waitForGapi() {
    return new Promise((resolve) => {
      if (typeof gapi !== 'undefined') {
        resolve();
      } else {
        const checkGapi = setInterval(() => {
          if (typeof gapi !== 'undefined') {
            clearInterval(checkGapi);
            resolve();
          }
        }, 100);
      }
    });
  }

  async function initializeServices() {
    try {
      console.log('Step 1: Creating services...');
      const vad = new VADService();
      const recorder = new AudioRecorderService();
      const storage = new StorageService();
      const drive = new DriveApiService();

      console.log('Step 2: Initializing storage...');
      await storage.initialize();

      console.log('Step 3: Requesting microphone permission...');
      const micGranted = await recorder.initialize();
      if (!micGranted) {
        setError('Microphone access denied. Please grant permission to use this app.');
        return;
      }

      console.log('Step 4: Waiting for Google API...');
      await waitForGapi();

      console.log('Step 5: Initializing Google Drive...');
      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

      if (!CLIENT_ID || !API_KEY) {
        throw new Error('Missing Google API credentials. Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in .env file');
      }

      await drive.initialize(CLIENT_ID, API_KEY);

      console.log('Step 6: Checking sign-in status...');
      // Check if user is already signed in
      if (!drive.isSignedIn()) {
        console.log('Step 7: Not signed in, prompting sign-in...');
        const signedIn = await drive.signIn();
        if (!signedIn) {
          setError('Google Drive sign-in failed. Please try again.');
          return;
        }
      } else {
        console.log('Step 7: Already signed in!');
      }

      console.log('Step 8: Creating transcription service...');
      const WORKER_URL = import.meta.env.VITE_TRANSCRIPTION_WORKER_URL;
      const transcription = WORKER_URL ? new TranscriptionService(WORKER_URL) : null;

      if (transcription && transcription.isAvailable()) {
        console.log('✓ Transcription service available at:', WORKER_URL);
      } else {
        console.warn('⚠ Transcription service not configured. Set VITE_TRANSCRIPTION_WORKER_URL in .env');
      }

      console.log('Step 9: Creating sync manager...');
      const syncManager = new SyncManager(storage, drive, transcription);

      // Set up sync status callback
      syncManager.setStatusChangeCallback((status) => {
        setSyncStatus(status);
      });

      // Initial sync status check
      const pendingCount = await storage.getPendingCount();
      const untranscribed = transcription ? await storage.getUntranscribedRecordings() : [];
      setSyncStatus({
        pending: pendingCount,
        syncing: false,
        transcribing: false,
        untranscribed: untranscribed.length,
      });

      console.log('Step 10: All initialized successfully!');
      setServices({ vad, recorder, storage, drive, syncManager, transcription });
      setInitialized(true);
    } catch (error) {
      console.error('❌ Initialization error:', error);
      console.error('Error details:', error.message, error.stack);
      setError(`Initialization failed: ${error.message}`);
    }
  }

  async function startSession() {
    if (!services) return;

    const { vad, recorder, storage, syncManager } = services;

    try {
      // Initialize VAD with callbacks
      await vad.initialize({
        onSpeechStart: async () => {
          console.log('Speech started - beginning recording');
          setIsRecording(true);
          recorder.startRecording();
        },
        onSpeechEnd: async () => {
          console.log('Speech ended - stopping recording');
          const blob = await recorder.stopRecording();
          if (blob && blob.size > 0) {
            await storage.saveRecording(blob, {});
            // Trigger sync
            syncManager.syncAll();
          }
          setIsRecording(false);
        }
      });

      vad.start();
      syncManager.startAutoSync();
      setSessionActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
      setError(`Failed to start session: ${error.message}`);
    }
  }

  function endSession() {
    if (!services) return;

    const { vad, recorder, syncManager } = services;

    try {
      vad.pause();
      if (recorder.isRecording) {
        recorder.stopRecording();
      }
      syncManager.stopAutoSync();
      // Do final sync
      syncManager.syncAll();
      setSessionActive(false);
      setIsRecording(false);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h1>❌ Error</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Initializing Voice to Drive...</p>
          <small>Requesting permissions and connecting to Google Drive</small>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎙️ Voice to Drive</h1>
        <p className="subtitle">Hands-free voice recording while driving</p>
      </header>

      <main className="app-main">
        <StatusIndicator
          recording={isRecording}
          syncStatus={syncStatus}
          online={online}
        />

        <SessionControl
          active={sessionActive}
          onStart={startSession}
          onEnd={endSession}
          disabled={!initialized}
        />

        <div className="instructions">
          {!sessionActive && (
            <>
              <h3>How to use:</h3>
              <ol>
                <li>Tap "Start Session" to begin</li>
                <li>Just talk naturally - recording starts automatically</li>
                <li>Each thought saves as a separate recording</li>
                <li>Recordings upload to Google Drive automatically</li>
                <li>Tap "End Session" when done</li>
              </ol>
            </>
          )}
          {sessionActive && (
            <>
              <h3>🎤 Session Active</h3>
              <p>Speak naturally - the app will automatically detect your voice and start recording.</p>
              <p>Recordings are saved to: <code>recordings/YYYY/MM/DD/</code></p>
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <small>
          {online ? '✓ Connected' : '⚠️ Offline mode - recordings will sync when online'}
        </small>
      </footer>
    </div>
  );
}

export default App;
