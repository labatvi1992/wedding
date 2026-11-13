/**
 * Pure Web Audio API Synthesizer for Wedding Ambient Music
 * Provides a gentle, romantic harp/piano melody when no external mp3 is provided.
 * Ensures the audio feature works out of the box without broken remote audio links!
 */

class WeddingAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: number | null = null;
  private step: number = 0;
  private customAudio: HTMLAudioElement | null = null;
  private customUrl: string = '';
  private onStateChange: ((playing: boolean) => void) | null = null;

  // Romantic Canon-in-D chord sequence notes in frequencies (Hz)
  private melodyNotes = [
    // D major chord progression
    293.66, 369.99, 440.00, 587.33, // D, F#, A, D
    220.00, 329.63, 440.00, 554.37, // A, E, A, C#
    246.94, 293.66, 369.99, 493.88, // Bm
    185.00, 277.18, 369.99, 440.00, // F#m
    196.00, 293.66, 392.00, 493.88, // G
    146.83, 220.00, 293.66, 369.99, // D
    196.00, 293.66, 392.00, 493.88, // G
    220.00, 329.63, 440.00, 554.37, // A
  ];

  public setCustomAudioUrl(url: string) {
    this.customUrl = url;
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (url) {
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
    }
  }

  public registerStateListener(listener: (playing: boolean) => void) {
    this.onStateChange = listener;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange(true);

    if (this.customAudio) {
      this.customAudio.play().catch(() => {
        // Fallback to synth if custom audio fails or blocked
        this.startSynth();
      });
      return;
    }

    this.startSynth();
  }

  private startSynth() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      // Soft gentle sine wave combined with warm harmonics
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      // Gentle bell envelope
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
    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange(false);

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
