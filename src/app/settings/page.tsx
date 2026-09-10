"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import styles from "./settings.module.css";

import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/context/LanguageContext";
import { useSound } from "@/context/SoundContext";
import { Language } from "@/lib/translations";

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const { theme: currentTheme, setTheme, font: currentFont, setFont } = useTheme();
    const { language: currentLang, setLanguage, t } = useLanguage();
    const {
        keyClickEnabled,
        ambientType,
        volume: soundVolume,
        setKeyClickEnabled,
        setAmbientType,
        setVolume: setSoundVolume,
        triggerKeyClick,
        hardStopAll,
    } = useSound();
    const [displayName, setDisplayName] = useState("");
    const [theme, setThemeOption] = useState("dark");
    const [font, setFontOption] = useState("default");
    const [bio, setBio] = useState("");
    const [language, setLanguageOption] = useState<Language>("ja");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setThemeOption(user.theme || "dark");
            setFontOption(user.font || "default");
            setBio(user.bio || "");
            setLanguageOption((user.language as Language) || "ja");
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage(null);

        try {
            // 1. Update Firebase Auth profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
            }

            // 2. Update Firestore user document
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { displayName, theme, font, bio, language });

            // 3. Update local contexts
            setTheme(theme);
            setFont(font);
            setLanguage(language);

            setMessage({ type: "success", text: t("settingsSuccess") });
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: "error", text: t("settingsError") });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) return <div className="container">{t("loadingPosts")}</div>;
    if (!user) return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <p>{t("loginRequired")}</p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>{t("login")}</Link>
        </div>
    );

    return (
        <main className="container fade-in">
            <header style={{ padding: '1.5rem 0' }}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--accent-color)' }}>{t("siteName")}</Link>
            </header>

            <div className={styles.content}>
                <h1 className={styles.title}>{t("settingsTitle")}</h1>

                <div className={styles.settingsCard}>
                    <form onSubmit={handleSave}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="displayName">{t("settingsDisplayName")}</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={t("ph_display_name")}
                                maxLength={20}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="bio">{t("settingsBio")}</label>
                            <input
                                id="bio"
                                type="text"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder={t("ph_bio") || "ひとこと"}
                                maxLength={50}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="theme">{t("settingsTheme")}</label>
                            <select
                                id="theme"
                                value={theme}
                                onChange={(e) => setThemeOption(e.target.value)}
                                className={styles.select}
                            >
                                <option value="dark">{t("theme_dark")}</option>
                                <option value="light">{t("theme_light")}</option>
                                <option value="parchment">{t("theme_parchment")}</option>
                                <option value="dusk">{t("theme_dusk")}</option>
                                <option value="forest">{t("theme_forest")}</option>
                                <option value="sakura">{t("theme_sakura")}</option>
                                <option value="midnight">{t("theme_midnight")}</option>
                                <option value="ocean">{t("theme_ocean")}</option>
                                <option value="sunset">{t("theme_sunset")}</option>
                                <option value="lavender">{t("theme_lavender")}</option>
                                <option value="zen">{t("theme_zen")}</option>
                                <option value="cyberpunk">{t("theme_cyberpunk") || "サイバーパンク"}</option>
                                <option value="aurora">{t("theme_aurora") || "オーロラ"}</option>
                                <option value="matcha">{t("theme_matcha") || "京都抹茶"}</option>
                                <option value="monochrome">{t("theme_monochrome") || "モノクローム"}</option>
                                <option value="starlight">{t("theme_starlight") || "スターライト"}</option>
                                <option value="pattern-dots">{t("theme_pattern_dots") || "夜空の星屑ドット (パターン)"}</option>
                                <option value="pattern-grid">{t("theme_pattern_grid") || "方眼ノート・思索 (パターン)"}</option>
                                <option value="pattern-waves">{t("theme_pattern_waves") || "青海波・波紋 (和風パターン)"}</option>
                                <option value="pattern-washi">{t("theme_pattern_washi") || "市松格子 (モダン和柄)"}</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="font">{t("settingsFont")}</label>
                            <select
                                id="font"
                                value={font}
                                onChange={(e) => setFontOption(e.target.value)}
                                className={styles.select}
                            >
                                <option value="default">{t("font_default")}</option>
                                <option value="soft">{t("font_soft")}</option>
                                <option value="handwriting">{t("font_handwriting")}</option>
                                <option value="rounded">{t("font_rounded")}</option>
                                <option value="serif">{t("font_serif") || "しっぽり明朝（文学的）"}</option>
                                <option value="gothic">{t("font_gothic") || "Noto Sans（角ゴシック）"}</option>
                                <option value="pixel">{t("font_pixel") || "DotGothic（レトロゲーム）"}</option>
                                <option value="elegant">{t("font_elegant") || "解星特民（優雅・明朝）"}</option>
                                <option value="kai">{t("font_kai") || "Yuji Boku（楷書・筆文字）"}</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="language">{t("settingsLanguage")}</label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguageOption(e.target.value as Language)}
                                className={styles.select}
                            >
                                <option value="ja">日本語 (Japanese)</option>
                                <option value="en">English</option>
                                <option value="es">Español (Spanish)</option>
                                <option value="zh">中文 (Chinese)</option>
                            </select>
                        </div>

                        {/* サウンド・演出設定 */}
                        <div style={{
                            marginTop: '1.5rem',
                            marginBottom: '1.5rem',
                            padding: '1.2rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎧 音響・サウンド演出 <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 'normal' }}>（Web Audio超軽量合成）</span>
                            </h3>

                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="keyClick"
                                    checked={keyClickEnabled}
                                    onChange={(e) => setKeyClickEnabled(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="keyClick" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                                    ⌨️ タイピング打鍵音（文字入力時の心地よいクリック音）
                                </label>
                                <button
                                    type="button"
                                    onClick={triggerKeyClick}
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        padding: '2px 8px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        color: 'inherit'
                                    }}
                                >
                                    試聴
                                </button>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="ambientSelect" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                    🌌 心を落ち着かせる環境BGM（外部音声の通信量ゼロ・完全無音から選択可）
                                </label>
                                <select
                                    id="ambientSelect"
                                    value={ambientType}
                                    onChange={(e) => setAmbientType(e.target.value as any)}
                                    className={styles.select}
                                >
                                    <option value="silence">オフ（完全無音・推奨）</option>
                                    <option value="rain">🌧️ 静かな雨音（雨の日の本音）</option>
                                    <option value="meditation">🧘 宇宙・静寂（メディテーション・深い思索）</option>
                                </select>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                    <span>🔊 音量調整</span>
                                    <span>{Math.round(soundVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="1"
                                    step="0.05"
                                    value={soundVolume}
                                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                            </div>

                            {ambientType !== "silence" && (
                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        onClick={hardStopAll}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: '1px solid #ef4444',
                                            color: '#f87171',
                                            borderRadius: '6px',
                                            padding: '4px 12px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        🛑 音声を即時完全停止（ミュート）
                                    </button>
                                </div>
                            )}
                        </div>

                        <button type="submit" className={`btn-primary ${styles.saveBtn}`} disabled={isSaving}>
                            {isSaving ? t("settingsSaving") : t("settingsSave")}
                        </button>

                        {message && (
                            <div className={`${styles.message} ${styles[message.type]}`}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>{t("backToHome")}</Link>
                </div>
            </div>
        </main>
    );
}
