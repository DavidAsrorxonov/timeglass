import type { AlarmSound } from "@/types";
import { supportsAudioContext } from "@/lib/browser-support";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type OscillatorTypeName = OscillatorType;

class AudioManagerClass {
  private context: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];

  private getContext() {
    if (!supportsAudioContext()) {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!this.context) {
      this.context = new AudioContextClass();
    }

    return this.context;
  }

  async unlock() {
    const context = this.getContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }
  }

  playTone(
    frequency: number,
    duration: number,
    type: OscillatorTypeName = "sine",
    delay = 0,
  ) {
    const context = this.getContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startsAt = context.currentTime + delay;
    const endsAt = startsAt + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startsAt);

    gain.gain.setValueAtTime(0.001, startsAt);
    gain.gain.exponentialRampToValueAtTime(0.2, startsAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, endsAt);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startsAt);
    oscillator.stop(endsAt);

    this.oscillators.push(oscillator);

    oscillator.onended = () => {
      this.oscillators = this.oscillators.filter((item) => item !== oscillator);
    };
  }

  playAlarmSound(sound: AlarmSound = "digital") {
    void this.unlock();

    if (sound === "bell") {
      this.playTone(880, 0.22, "sine", 0);
      this.playTone(660, 0.22, "sine", 0.24);
      this.playTone(440, 0.3, "sine", 0.48);
      return;
    }

    if (sound === "gentle") {
      this.playTone(523.25, 0.4, "sine", 0);
      this.playTone(659.25, 0.4, "sine", 0.45);
      this.playTone(783.99, 0.5, "sine", 0.9);
      return;
    }

    if (sound === "pulse") {
      for (let index = 0; index < 5; index += 1) {
        this.playTone(700, 0.12, "sine", index * 0.22);
      }
      return;
    }

    for (let index = 0; index < 6; index += 1) {
      this.playTone(950, 0.08, "square", index * 0.14);
    }
  }

  stopAllSounds() {
    this.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // Oscillator may already be stopped.
      }
    });

    this.oscillators = [];
  }
}

export const AudioManager = new AudioManagerClass();

export function playAlertTone() {
  AudioManager.playAlarmSound("digital");
}
