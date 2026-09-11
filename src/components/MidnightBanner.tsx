"use client";

import { useState, useEffect } from "react";
import styles from "./MidnightBanner.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSound } from "@/context/SoundContext";

export default function MidnightBanner() {
    const { t } = useLanguage();
    const { ambientType, setAmbientType } = useSound();
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        try {
            const dismissed = sessionStorage.getItem("shizunari_midnight_dismissed");
            if (dismissed === "true") {
                return;
            }

            const mode = localStorage.getItem("shizunari_midnight_mode") || "auto";

            let shouldShow = false;
            if (mode === "always") {
                shouldShow = true;
            } else if (mode === "off") {
                shouldShow = false;
            } else {
                // Auto mode: check if local time is between 21:00 and 05:00
                const hour = new Date().getHours();
                shouldShow = hour >= 21 || hour < 5;
            }

            setIsVisible(shouldShow);
            if (shouldShow) {
                document.body.classList.add("midnight-mode");
            }
        } catch {}

        return () => {
            if (typeof document !== "undefined") {
                document.body.classList.remove("midnight-mode");
            }
        };
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            sessionStorage.setItem("shizunari_midnight_dismissed", "true");
            document.body.classList.remove("midnight-mode");
        } catch {}
    };

    const toggleZenSound = () => {
        if (ambientType === "water_drop") {
            setAmbientType("silence");
        } else {
            setAmbientType("water_drop");
        }
    };

    if (!isMounted || !isVisible) return null;

    const isPlayingWaterDrop = ambientType === "water_drop";

    return (
        <div className={styles.banner} role="status" aria-label="深夜の静寂モード">
            <div className={styles.left}>
                <span className={styles.moonIcon} aria-hidden="true">🌙</span>
                <div className={styles.textGroup}>
                    <div className={styles.title}>
                        <span>{t("midnightTitle") || "静夜のひととき"}</span>
                        <span style={{ fontSize: "0.75rem", opacity: 0.7, fontWeight: 400 }}>| Midnight Serenity</span>
                    </div>
                    <p className={styles.subtitle}>
                        {t("midnightSub") || "夜が深まりました。無理に言葉を探さず、静かに心と呼吸を整えるだけでも十分です。"}
                    </p>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={toggleZenSound}
                    className={`${styles.playBtn} ${isPlayingWaterDrop ? styles.playBtnActive : ""}`}
                    title="水琴窟の澄んだ水滴音を流す"
                >
                    <span>{isPlayingWaterDrop ? "⏸️" : "💧"}</span>
                    <span>{isPlayingWaterDrop ? (t("midnightSoundStop") || "水琴窟を止める") : (t("midnightSoundPlay") || "水琴窟の音を流す")}</span>
                </button>
                <button
                    onClick={handleDismiss}
                    className={styles.dismissBtn}
                    aria-label="今夜は閉じる"
                >
                    ✕ {t("midnightDismiss") || "今夜は閉じる"}
                </button>
            </div>
        </div>
    );
}
