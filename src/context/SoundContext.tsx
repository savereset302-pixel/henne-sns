"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { playKeyClick, startAmbientSound, stopAmbientSound, setAmbientVolume } from "@/lib/soundEffects";

export type AmbientSoundType = "silence" | "rain" | "meditation";

interface SoundContextType {
    keyClickEnabled: boolean;
    ambientType: AmbientSoundType;
    volume: number;
    setKeyClickEnabled: (enabled: boolean) => void;
    setAmbientType: (type: AmbientSoundType) => void;
    setVolume: (volume: number) => void;
    triggerKeyClick: () => void;
}

const SoundContext = createContext<SoundContextType>({
    keyClickEnabled: false,
    ambientType: "silence",
    volume: 0.5,
    setKeyClickEnabled: () => {},
    setAmbientType: () => {},
    setVolume: () => {},
    triggerKeyClick: () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [keyClickEnabled, setKeyClickEnabledState] = useState<boolean>(false);
    const [ambientType, setAmbientTypeState] = useState<AmbientSoundType>("silence");
    const [volume, setVolumeState] = useState<number>(0.5);
    const [hasInteracted, setHasInteracted] = useState<boolean>(false);

    // Load sound settings from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("honne_sound_settings");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.keyClickEnabled === "boolean") setKeyClickEnabledState(parsed.keyClickEnabled);
                if (parsed.ambientType) setAmbientTypeState(parsed.ambientType);
                if (typeof parsed.volume === "number") setVolumeState(parsed.volume);
            }
        } catch {}
    }, []);

    // Save sound settings on change
    const saveSettings = (newKeyClick: boolean, newAmbient: AmbientSoundType, newVol: number) => {
        try {
            localStorage.setItem(
                "honne_sound_settings",
                JSON.stringify({ keyClickEnabled: newKeyClick, ambientType: newAmbient, volume: newVol })
            );
        } catch {}
    };

    const setKeyClickEnabled = (enabled: boolean) => {
        setKeyClickEnabledState(enabled);
        saveSettings(enabled, ambientType, volume);
    };

    const setAmbientType = (type: AmbientSoundType) => {
        setAmbientTypeState(type);
        saveSettings(keyClickEnabled, type, volume);
        if (type === "silence") {
            stopAmbientSound();
        } else {
            startAmbientSound(type, volume);
        }
    };

    const setVolume = (newVol: number) => {
        setVolumeState(newVol);
        saveSettings(keyClickEnabled, ambientType, newVol);
        setAmbientVolume(newVol);
    };

    const triggerKeyClick = () => {
        if (keyClickEnabled) {
            playKeyClick(volume);
        }
    };

    // Listen to global keypress on inputs and textareas if keyClickEnabled
    useEffect(() => {
        if (!keyClickEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger on typing keys in input, textarea, or contenteditable
            const target = e.target as HTMLElement;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
                if (e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Meta") {
                    playKeyClick(volume);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [keyClickEnabled, volume]);

    // Handle initial browser user gesture for ambient audio
    useEffect(() => {
        if (ambientType === "silence") return;

        const handleFirstInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
                startAmbientSound(ambientType, volume);
            }
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
        };

        window.addEventListener("click", handleFirstInteraction);
        window.addEventListener("keydown", handleFirstInteraction);

        return () => {
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
        };
    }, [ambientType, volume, hasInteracted]);

    return (
        <SoundContext.Provider
            value={{
                keyClickEnabled,
                ambientType,
                volume,
                setKeyClickEnabled,
                setAmbientType,
                setVolume,
                triggerKeyClick,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
