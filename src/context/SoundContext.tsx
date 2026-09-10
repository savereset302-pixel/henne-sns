"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { playKeyClick, startAmbientSound, stopAmbientSound, emergencyStopAll, setAmbientVolume } from "@/lib/soundEffects";

export type AmbientSoundType = "silence" | "rain" | "meditation";

interface SoundContextType {
    keyClickEnabled: boolean;
    ambientType: AmbientSoundType;
    volume: number;
    setKeyClickEnabled: (enabled: boolean) => void;
    setAmbientType: (type: AmbientSoundType) => void;
    setVolume: (volume: number) => void;
    triggerKeyClick: () => void;
    hardStopAll: () => void;
}

const SoundContext = createContext<SoundContextType>({
    keyClickEnabled: false,
    ambientType: "silence",
    volume: 0.5,
    setKeyClickEnabled: () => {},
    setAmbientType: () => {},
    setVolume: () => {},
    triggerKeyClick: () => {},
    hardStopAll: () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [keyClickEnabled, setKeyClickEnabledState] = useState<boolean>(false);
    const [ambientType, setAmbientTypeState] = useState<AmbientSoundType>("silence");
    const [volume, setVolumeState] = useState<number>(0.5);

    // Load settings from localStorage once
    useEffect(() => {
        try {
            const saved = localStorage.getItem("honne_sound_settings");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.keyClickEnabled === "boolean") setKeyClickEnabledState(parsed.keyClickEnabled);
                // Note: Always start ambient sound as silence on fresh page load to respect user comfort
                if (typeof parsed.volume === "number") setVolumeState(parsed.volume);
            }
        } catch {}
    }, []);

    const saveSettings = (newKeyClick: boolean, newAmbient: AmbientSoundType, newVol: number) => {
        try {
            localStorage.setItem(
                "honne_sound_settings",
                JSON.stringify({ keyClickEnabled: newKeyClick, ambientType: newAmbient, volume: newVol })
            );
        } catch {}
    };

    const setKeyClickEnabled = useCallback((enabled: boolean) => {
        setKeyClickEnabledState(enabled);
        saveSettings(enabled, ambientType, volume);
    }, [ambientType, volume]);

    const setAmbientType = useCallback((type: AmbientSoundType) => {
        setAmbientTypeState(type);
        saveSettings(keyClickEnabled, type, volume);
        if (type === "silence") {
            stopAmbientSound();
        } else {
            startAmbientSound(type, volume);
        }
    }, [keyClickEnabled, volume]);

    const setVolume = useCallback((newVol: number) => {
        setVolumeState(newVol);
        saveSettings(keyClickEnabled, ambientType, newVol);
        setAmbientVolume(newVol);
    }, [keyClickEnabled, ambientType]);

    const triggerKeyClick = useCallback(() => {
        if (keyClickEnabled) {
            playKeyClick(volume);
        }
    }, [keyClickEnabled, volume]);

    const hardStopAll = useCallback(() => {
        setAmbientTypeState("silence");
        saveSettings(keyClickEnabled, "silence", volume);
        emergencyStopAll();
    }, [keyClickEnabled, volume]);

    // Clean up audio on unmount or page exit
    useEffect(() => {
        return () => {
            stopAmbientSound();
        };
    }, []);

    // Listen to typing keys only if keyClickEnabled
    useEffect(() => {
        if (!keyClickEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
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
                hardStopAll,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
