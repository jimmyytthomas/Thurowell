type BreathSoundKind = 'inhale' | 'exhale';

type AudioContextCtor = typeof AudioContext;

function getAudioContextConstructor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const withWebkit = window as Window & {
    webkitAudioContext?: AudioContextCtor;
  };
  return window.AudioContext ?? withWebkit.webkitAudioContext;
}

function createPinkNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

class BreathAudio {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private generation = 0;

  private ensureContext(): AudioContext | null {
    const Ctor = getAudioContextConstructor();
    if (!Ctor) return null;
    if (!this.ctx) {
      this.ctx = new Ctor();
      this.noise = createPinkNoiseBuffer(this.ctx);
    }
    return this.ctx;
  }

  async unlock(): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Still blocked until a later user gesture
      }
    }
  }

  private stopCurrent(): void {
    if (!this.ctx || !this.source || !this.gain) {
      this.source = null;
      this.gain = null;
      return;
    }

    const now = this.ctx.currentTime;
    const source = this.source;
    const gain = this.gain;
    this.source = null;
    this.gain = null;

    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0, gain.gain.value), now);
      gain.gain.linearRampToValueAtTime(0, now + 0.04);
      source.stop(now + 0.05);
    } catch {
      // Already stopped
    }
  }

  stop(): void {
    this.generation += 1;
    this.stopCurrent();
  }

  async play(kind: BreathSoundKind, duration: number): Promise<void> {
    const id = this.generation + 1;
    this.generation = id;
    await this.unlock();
    if (id !== this.generation) return;

    const ctx = this.ctx;
    if (!ctx || !this.noise || duration <= 0 || ctx.state !== 'running') {
      return;
    }

    this.stopCurrent();

    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 0.75;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.Q.value = 0.7;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const dur = Math.max(0.08, duration);

    if (kind === 'inhale') {
      bandpass.frequency.setValueAtTime(720, now);
      bandpass.frequency.linearRampToValueAtTime(1180, now + dur);
      lowpass.frequency.setValueAtTime(1500, now);
      lowpass.frequency.linearRampToValueAtTime(2300, now + dur);

      const peak = 0.15;
      const attack = Math.min(dur * 0.35, 0.9);
      const release = Math.min(dur * 0.22, 0.45);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peak, now + attack);
      gain.gain.setValueAtTime(peak, now + Math.max(attack, dur - release));
      gain.gain.linearRampToValueAtTime(0, now + dur);
    } else {
      bandpass.frequency.setValueAtTime(520, now);
      bandpass.frequency.linearRampToValueAtTime(280, now + dur);
      lowpass.frequency.setValueAtTime(1700, now);
      lowpass.frequency.linearRampToValueAtTime(850, now + dur);

      const peak = 0.18;
      const attack = Math.min(0.08, dur * 0.18);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peak, now + attack);
      gain.gain.linearRampToValueAtTime(0, now + dur);
    }

    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + dur + 0.02);

    this.source = source;
    this.gain = gain;

    source.onended = () => {
      if (this.source === source) {
        this.source = null;
        this.gain = null;
      }
    };
  }
}

const breathAudio = new BreathAudio();

export function unlockBreathAudio(): void {
  void breathAudio.unlock();
}

export function stopBreathAudio(): void {
  breathAudio.stop();
}

export function playBreathAudio(
  kind: BreathSoundKind,
  durationSeconds: number,
): void {
  void breathAudio.play(kind, durationSeconds);
}

export function soundKindForPhaseLabel(
  label: string,
): BreathSoundKind | null {
  if (label === 'Inhale' || label === 'Inhale (sip)') return 'inhale';
  if (label === 'Exhale') return 'exhale';
  return null;
}
