/**
 * Wedding Audio Player for "Love Paradise - Kelly Chen"
 * Defaults to the local MP3 (/assets/aistudio/love-paradise.mp3) with automatic playback
 * on page load and instant unlock on first user interaction (scroll/touch/click) if browser
 * autoplay policy requires gesture activation.
 */

const DEFAULT_LOVE_PARADISE_URL = '/assets/aistudio/love-paradise.mp3';

class WeddingAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: number | null = null;
  private step: number = 0;
  private customAudio: HTMLAudioElement | null = null;
  private customUrl: string = DEFAULT_LOVE_PARADISE_URL;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private unlockHandlerAttached: boolean = false;
  private userManuallyPaused: boolean = false;

  // Fallback Love Paradise melody notes in frequencies (Hz)
  private melodyNotes = [
    329.63, 392.00, 493.88, 659.25,
    587.33, 493.88, 392.00, 440.00,
    523.25, 493.88, 440.00, 392.00,
    349.23, 392.00, 440.00, 493.88,
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement(this.customUrl);
    }
  }

  private initAudioElement(url: string) {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (url) {
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
      this.customAudio.preload = 'auto';
      this.customAudio.volume = 0.75;
    }
  }

  private notifyListeners(playing: boolean) {
    this.isPlaying = playing;
    this.listeners.forEach((cb) => cb(playing));
  }

  public setCustomAudioUrl(url: string) {
    const nextUrl = url || DEFAULT_LOVE_PARADISE_URL;
    if (this.customUrl === nextUrl && this.customAudio) return;
    this.customUrl = nextUrl;
    this.initAudioElement(this.customUrl);
    if (this.isPlaying) {
      this.play();
    }
  }

  public registerStateListener(listener: (playing: boolean) => void) {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public startAutoPlay() {
    if (this.userManuallyPaused || this.isPlaying) return;

    if (!this.customAudio) {
      this.initAudioElement(this.customUrl);
    }

    if (this.customAudio) {
      const playPromise = this.customAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.notifyListeners(true);
          })
          .catch(() => {
            // Browser blocked immediate unmuted autoplay; unlock on first scroll/touch/click
            this.attachInteractionUnlock();
          });
      }
    }
  }

  private attachInteractionUnlock() {
    if (this.unlockHandlerAttached || typeof window === 'undefined') return;
    this.unlockHandlerAttached = true;

    const unlockEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'scroll', 'keydown'];

    const handleUnlock = () => {
      if (this.userManuallyPaused || this.isPlaying) {
        cleanup();
        return;
      }
      if (this.customAudio) {
        this.customAudio
          .play()
          .then(() => {
            this.notifyListeners(true);
            cleanup();
          })
          .catch(() => {
            // Keep listeners attached until a valid user gesture unlocks audio
          });
      }
    };

    const cleanup = () => {
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUnlock, true);
      });
      this.unlockHandlerAttached = false;
    };

    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, handleUnlock, { capture: true, passive: true });
    });
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.userManuallyPaused = true;
      this.pause();
      return false;
    } else {
      this.userManuallyPaused = false;
      this.play();
      return true;
    }
  }

  public play() {
    if (!this.customAudio) {
      this.initAudioElement(this.customUrl);
    }

    if (this.customAudio) {
      this.customAudio
        .play()
        .then(() => {
          this.notifyListeners(true);
        })
        .catch(() => {
          this.notifyListeners(true);
          this.startSynth();
        });
      return;
    }

    this.notifyListeners(true);
    this.startSynth();
  }

  private startSynth() {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.playNextArpeggio();
    this.timer = window.setInterval(() => {
      this.playNextArpeggio();
    }, 450);
  }

  private playNextArpeggio() {
    if (!this.audioCtx || !this.isPlaying) return;

    try {
      const freq = this.melodyNotes[this.step % this.melodyNotes.length];
      this.step++;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 1.2);
    } catch {
      // Ignore audio scheduling exceptions
    }
  }

  public pause() {
    this.notifyListeners(false);

    if (this.customAudio) {
      this.customAudio.pause();
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const weddingAudioPlayer = new WeddingAudioPlayer();
