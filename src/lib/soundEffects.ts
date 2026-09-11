// Web Audio API procedural sound engine - Pure synthesis, 0MB network overhead
// Guaranteed leak-free, deterministic stop & audio filtering

let audioCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let activeSources: (AudioNode & { stop?: () => void })[] = [];
let activeTimers: (number | NodeJS.Timeout)[] = [];
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
 * Helper to generate pink noise buffer
 */
function createPinkNoiseBuffer(ctx: AudioContext, seconds: number = 3): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
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
    return noiseBuffer;
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
    } catch {}
}

/**
 * Play a single crystal-clear water droplet sound (Suikinkutsu pentatonic bell tone)
 */
export function playWaterDropSound(volume: number = 0.3) {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const dropFrequencies = [1175, 1318, 1568, 1760, 2093, 2349];
        const freq = dropFrequencies[Math.floor(Math.random() * dropFrequencies.length)];

        const osc = ctx.createOscillator();
        osc.type = "sine";
        // Subtle pitch bend down to simulate water surface collision
        osc.frequency.setValueAtTime(freq * 1.08, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.035);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
    } catch {}
}


/**
 * Stop all ambient audio nodes IMMEDIATELY (no timeouts, no zombie nodes, no leaks)
 */
export function stopAmbientSound() {
    currentAmbientType = null;

    // 1. Clear all procedural timers
    for (const timer of activeTimers) {
        clearInterval(timer as any);
        clearTimeout(timer as any);
    }
    activeTimers = [];

    // 2. Instantly stop and disconnect all active sources
    for (const source of activeSources) {
        try {
            source.stop?.();
            source.disconnect();
        } catch {}
    }
    activeSources = [];

    // 3. Disconnect master ambient gain node
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

export type SupportedAmbientType = "silence" | "rain" | "fireplace" | "waves" | "water_drop" | "breeze" | "meditation";

/**
 * Start procedural ambient sound with multi-stage frequency shaping
 */
export function startAmbientSound(type: SupportedAmbientType, volume: number = 0.15) {
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
        ambientGain.gain.linearRampToValueAtTime(Math.min(0.35, volume * 0.4), ctx.currentTime + 0.8);
        ambientGain.connect(ctx.destination);

        if (type === "rain") {
            // Gentle rain: pink noise with strict highpass filter to eliminate sub-bass rumble ("ゴーッ")
            const noiseBuffer = createPinkNoiseBuffer(ctx, 2);
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;

            const highpass = ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.setValueAtTime(450, ctx.currentTime);
            highpass.Q.setValueAtTime(0.7, ctx.currentTime);

            const peak = ctx.createBiquadFilter();
            peak.type = "peaking";
            peak.frequency.setValueAtTime(2800, ctx.currentTime);
            peak.gain.setValueAtTime(3, ctx.currentTime);
            peak.Q.setValueAtTime(1.0, ctx.currentTime);

            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(6500, ctx.currentTime);

            noiseSource.connect(highpass);
            highpass.connect(peak);
            peak.connect(lowpass);
            lowpass.connect(ambientGain);

            noiseSource.start();
            activeSources.push(noiseSource);

        } else if (type === "fireplace") {
            // Cozy Fireplace: warm ember noise + procedurally scheduled crackles
            const noiseBuffer = createPinkNoiseBuffer(ctx, 2);
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.setValueAtTime(600, ctx.currentTime);
            bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

            const emberGain = ctx.createGain();
            emberGain.gain.setValueAtTime(0.3, ctx.currentTime);

            noiseSource.connect(bandpass);
            bandpass.connect(emberGain);
            emberGain.connect(ambientGain);

            noiseSource.start();
            activeSources.push(noiseSource);

            // Procedural firewood crackles
            const scheduleCrackle = () => {
                if (!ambientGain || currentAmbientType !== "fireplace") return;
                try {
                    const now = ctx.currentTime;
                    const crackleBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.025), ctx.sampleRate);
                    const data = crackleBuffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) {
                        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
                    }
                    const cSource = ctx.createBufferSource();
                    cSource.buffer = crackleBuffer;

                    const cFilter = ctx.createBiquadFilter();
                    cFilter.type = "highpass";
                    cFilter.frequency.setValueAtTime(1200 + Math.random() * 2500, now);

                    const cGain = ctx.createGain();
                    cGain.gain.setValueAtTime((0.15 + Math.random() * 0.45), now);

                    cSource.connect(cFilter);
                    cFilter.connect(cGain);
                    cGain.connect(ambientGain);

                    cSource.start(now);
                    cSource.stop(now + 0.03);
                } catch {}

                const nextDelay = 80 + Math.random() * 280;
                const tid = setTimeout(scheduleCrackle, nextDelay);
                activeTimers.push(tid);
            };
            const tid = setTimeout(scheduleCrackle, 100);
            activeTimers.push(tid);

        } else if (type === "waves") {
            // Calm Ocean Waves: Pink noise with continuous 12-second periodic swell & retreat
            const noiseBuffer = createPinkNoiseBuffer(ctx, 4);
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(400, ctx.currentTime);
            filter.Q.setValueAtTime(1.5, ctx.currentTime);

            const waveGain = ctx.createGain();
            waveGain.gain.setValueAtTime(0.1, ctx.currentTime);

            // 12-second swell LFO
            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(1 / 12, ctx.currentTime); // ~0.083 Hz

            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(waveGain.gain);

            // Also sweep filter frequency gently
            const filterLfoGain = ctx.createGain();
            filterLfoGain.gain.setValueAtTime(600, ctx.currentTime);
            lfo.connect(filterLfoGain);
            filterLfoGain.connect(filter.frequency);

            noiseSource.connect(filter);
            filter.connect(waveGain);
            waveGain.connect(ambientGain);

            noiseSource.start();
            lfo.start();
            activeSources.push(noiseSource, lfo);

        } else if (type === "water_drop") {
            // Suikinkutsu / Zen Water Droplets: Crystal clear acoustic drops with natural reverb-like decay
            const dropFrequencies = [1175, 1318, 1568, 1760, 2093, 2349]; // Pentatonic crystal tones

            const scheduleDrop = () => {
                if (!ambientGain || currentAmbientType !== "water_drop") return;
                try {
                    const now = ctx.currentTime;
                    const freq = dropFrequencies[Math.floor(Math.random() * dropFrequencies.length)];

                    const osc = ctx.createOscillator();
                    osc.type = "sine";
                    // Slight pitch bend down to simulate water surface impact
                    osc.frequency.setValueAtTime(freq * 1.08, now);
                    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.03);

                    const dGain = ctx.createGain();
                    dGain.gain.setValueAtTime(0.0001, now);
                    dGain.gain.linearRampToValueAtTime(0.35, now + 0.01);
                    dGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

                    osc.connect(dGain);
                    dGain.connect(ambientGain);

                    osc.start(now);
                    osc.stop(now + 1.3);
                } catch {}

                const nextDelay = 1500 + Math.random() * 1800;
                const tid = setTimeout(scheduleDrop, nextDelay);
                activeTimers.push(tid);
            };
            const tid = setTimeout(scheduleDrop, 200);
            activeTimers.push(tid);

        } else if (type === "breeze") {
            // Forest Breeze: Soft noise high-passed at 380Hz (zero rumble) modulated by gentle slow sweep
            const noiseBuffer = createPinkNoiseBuffer(ctx, 3);
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;

            const highpass = ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.setValueAtTime(380, ctx.currentTime);

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "lowpass";
            bandpass.frequency.setValueAtTime(900, ctx.currentTime);
            bandpass.Q.setValueAtTime(1.0, ctx.currentTime);

            const bLfo = ctx.createOscillator();
            bLfo.frequency.setValueAtTime(1 / 8, ctx.currentTime); // 8-second gentle gust cycle

            const bLfoGain = ctx.createGain();
            bLfoGain.gain.setValueAtTime(450, ctx.currentTime);
            bLfo.connect(bLfoGain);
            bLfoGain.connect(bandpass.frequency);

            noiseSource.connect(highpass);
            highpass.connect(bandpass);
            bandpass.connect(ambientGain);

            noiseSource.start();
            bLfo.start();
            activeSources.push(noiseSource, bLfo);

        } else if (type === "meditation") {
            // Meditative calm: Pure crystal-clear 432Hz sine tone with gentle harmonic
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(432, ctx.currentTime);
            osc2.frequency.setValueAtTime(216, ctx.currentTime);

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
            ambientGain.gain.linearRampToValueAtTime(Math.min(0.35, volume * 0.4), audioCtx.currentTime + 0.05);
        } catch {}
    }
}
