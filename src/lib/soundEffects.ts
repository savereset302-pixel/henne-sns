// Web Audio API procedural sound engine - Pure synthesis, 0MB network overhead
// Guaranteed leak-free, deterministic stop & audio filtering

let audioCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let activeSources: (AudioNode & { stop?: () => void })[] = [];
let currentAmbientType: string | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

/**
 * Play a delicate, tactile keypress click (typewriter / membrane sound)
 */
export function playKeyClick(volume: number = 0.1) {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(700 + Math.random() * 150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.02);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1800, now);

        gain.gain.setValueAtTime(volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    } catch {
        // Ignore audio errors gracefully
    }
}

/**
 * Stop all ambient audio nodes IMMEDIATELY (no timeouts, no zombie nodes)
 */
export function stopAmbientSound() {
    currentAmbientType = null;

    // 1. Instantly stop and disconnect all active sources
    for (const source of activeSources) {
        try {
            source.stop?.();
            source.disconnect();
        } catch {}
    }
    activeSources = [];

    // 2. Disconnect master ambient gain node
    if (ambientGain) {
        try {
            ambientGain.gain.setValueAtTime(0, audioCtx?.currentTime || 0);
            ambientGain.disconnect();
        } catch {}
        ambientGain = null;
    }
}

/**
 * Emergency complete stop: kills all audio and suspends context
 */
export function emergencyStopAll() {
    stopAmbientSound();
    if (audioCtx && audioCtx.state === "running") {
        try {
            audioCtx.suspend().catch(() => {});
        } catch {}
    }
}

/**
 * Start procedural ambient sound with multi-stage frequency shaping
 */
export function startAmbientSound(type: "rain" | "meditation" | "silence", volume: number = 0.15) {
    // Always completely stop previous sound first
    stopAmbientSound();

    if (type === "silence") {
        return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    currentAmbientType = type;

    try {
        // Master gain for ambient track
        ambientGain = ctx.createGain();
        ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        ambientGain.gain.linearRampToValueAtTime(Math.min(0.3, volume * 0.35), ctx.currentTime + 0.8);
        ambientGain.connect(ctx.destination);

        if (type === "rain") {
            // Gentle rain: pink noise with strict highpass filter to eliminate sub-bass rumble ("ゴーッ")
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.02;
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;

            // 1. Highpass filter at 450Hz: Strips out ALL low "ゴーッ" engine rumble
            const highpass = ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.setValueAtTime(450, ctx.currentTime);
            highpass.Q.setValueAtTime(0.7, ctx.currentTime);

            // 2. Peaking filter at 2800Hz: Brings out crisp, gentle raindrop patter
            const peak = ctx.createBiquadFilter();
            peak.type = "peaking";
            peak.frequency.setValueAtTime(2800, ctx.currentTime);
            peak.gain.setValueAtTime(3, ctx.currentTime);
            peak.Q.setValueAtTime(1.0, ctx.currentTime);

            // 3. Lowpass filter at 6500Hz: Cuts harsh hiss
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(6500, ctx.currentTime);

            noiseSource.connect(highpass);
            highpass.connect(peak);
            peak.connect(lowpass);
            lowpass.connect(ambientGain);

            noiseSource.start();
            activeSources.push(noiseSource);

        } else if (type === "meditation") {
            // Meditative calm: Pure crystal-clear 432Hz sine tone with gentle harmonic
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz healing frequency
            osc2.frequency.setValueAtTime(216, ctx.currentTime); // Gentle sub octave

            const subGain1 = ctx.createGain();
            const subGain2 = ctx.createGain();
            subGain1.gain.setValueAtTime(0.4, ctx.currentTime);
            subGain2.gain.setValueAtTime(0.2, ctx.currentTime);

            osc1.connect(subGain1);
            osc2.connect(subGain2);
            subGain1.connect(ambientGain);
            subGain2.connect(ambientGain);

            osc1.start();
            osc2.start();
            activeSources.push(osc1, osc2);
        }
    } catch (e) {
        console.warn("Ambient audio start error:", e);
        stopAmbientSound();
    }
}

/**
 * Adjust volume smoothly in real time
 */
export function setAmbientVolume(volume: number) {
    if (ambientGain && audioCtx) {
        try {
            ambientGain.gain.linearRampToValueAtTime(Math.min(0.3, volume * 0.35), audioCtx.currentTime + 0.05);
        } catch {}
    }
}
