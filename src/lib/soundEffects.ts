// Web Audio API procedural sound engine - 0MB external assets, pure code synthesis

let audioCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let ambientSource: AudioNode | null = null;
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

        // Subtle wooden/mechanical click frequency
        osc.type = "sine";
        osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, now);

        gain.gain.setValueAtTime(volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
    } catch {
        // Ignore audio errors gracefully
    }
}

/**
 * Start procedural ambient sound (pure synthesis, no network traffic)
 */
export function startAmbientSound(type: "rain" | "meditation" | "silence", volume: number = 0.15) {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAmbientSound();
    if (type === "silence") return;

    currentAmbientType = type;

    try {
        ambientGain = ctx.createGain();
        ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        ambientGain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 1.5);
        ambientGain.connect(ctx.destination);

        if (type === "rain") {
            // Procedural rain using filtered pink noise
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
                b6 = white * 0.115926;
            }

            const whiteNoise = ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1000, ctx.currentTime);

            whiteNoise.connect(filter);
            filter.connect(ambientGain);
            whiteNoise.start();
            ambientSource = whiteNoise;
        } else if (type === "meditation") {
            // Meditative calm drone (warm 174Hz and 285Hz harmony)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(174, ctx.currentTime); // Solfeggio frequency
            osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4 gentle harmonic

            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.5, ctx.currentTime);

            osc1.connect(subGain);
            osc2.connect(subGain);
            subGain.connect(ambientGain);

            osc1.start();
            osc2.start();
            ambientSource = subGain;
        }
    } catch (e) {
        console.warn("Ambient audio init failed:", e);
    }
}

/**
 * Stop ambient sound with smooth fade-out
 */
export function stopAmbientSound() {
    if (ambientGain && audioCtx) {
        try {
            const now = audioCtx.currentTime;
            ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
            setTimeout(() => {
                if (ambientSource) {
                    try {
                        (ambientSource as any).stop?.();
                        ambientSource.disconnect();
                    } catch {}
                    ambientSource = null;
                }
                ambientGain = null;
                currentAmbientType = null;
            }, 900);
        } catch {
            ambientSource = null;
            ambientGain = null;
            currentAmbientType = null;
        }
    } else {
        ambientSource = null;
        ambientGain = null;
        currentAmbientType = null;
    }
}

/**
 * Adjust ambient sound volume in real-time
 */
export function setAmbientVolume(volume: number) {
    if (ambientGain && audioCtx) {
        try {
            ambientGain.gain.linearRampToValueAtTime(volume * 0.4, audioCtx.currentTime + 0.1);
        } catch {}
    }
}
