// TEMPORARILY DISABLED FOR DEBUGGING
// import { MicVAD } from '@ricky0123/vad-web';

export class VADService {
  constructor() {
    this.vad = null;
    this.isInitialized = false;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
  }

  async initialize(callbacks) {
    console.warn('⚠️ VAD temporarily disabled for debugging');
    this.onSpeechStart = callbacks.onSpeechStart;
    this.onSpeechEnd = callbacks.onSpeechEnd;

    // TEMPORARILY DISABLED - VAD library causing module loading errors
    // this.vad = await MicVAD.new({
    //   onSpeechStart: () => {
    //     console.log('Speech detected');
    //     this.onSpeechStart?.();
    //   },
    //   onSpeechEnd: () => {
    //     console.log('Speech ended');
    //     this.onSpeechEnd?.();
    //   },
    //   positiveSpeechThreshold: 0.8,  // Tunable for car noise
    //   minSpeechFrames: 3,
    //   redemptionFrames: 8,  // How long to wait before considering silence
    // });

    this.isInitialized = true;
  }

  start() {
    if (this.vad) {
      this.vad.start();
    }
  }

  pause() {
    if (this.vad) {
      this.vad.pause();
    }
  }

  destroy() {
    if (this.vad) {
      this.vad.destroy();
      this.vad = null;
      this.isInitialized = false;
    }
  }
}
