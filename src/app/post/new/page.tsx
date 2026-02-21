"use client";

import { useState } from "react";
import styles from "./newPost.module.css";
import { db, auth, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/lib/imageUtils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function NewPostPage() {
    const { t } = useLanguage();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("哲学");
    const [commentPolicy, setCommentPolicy] = useState("all");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isEphemeral, setIsEphemeral] = useState(false);
    const [sentimentMode, setSentimentMode] = useState("none"); // none, manual, ai
    const [sentiment, setSentiment] = useState("none");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
        if (e) e.preventDefault();

        if (!auth.currentUser) {
            alert("ログインが必要です");
            router.push("/login");
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = null;
            if (imageFile) {
                const compressedBlob = await compressImage(imageFile);
                const storageRef = ref(storage, `posts/${auth.currentUser.uid}/${Date.now()}_image.jpg`);
                const snapshot = await uploadBytes(storageRef, compressedBlob);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            let finalSentiment = sentiment;

            if (!isDraft && sentimentMode === "ai") {
                const res = await fetch("/api/analyze-sentiment", {
                    method: "POST",
                    body: JSON.stringify({ content })
                });
                const data = await res.json();
                if (data.success) {
                    finalSentiment = data.sentiment;
                }
            } else if (sentimentMode === "none") {
                finalSentiment = "none";
            }

            const collectionName = isDraft ? "drafts" : "posts";
            const data: any = {
                title,
                content,
                category,
                authorId: auth.currentUser.uid,
                authorName: isAnonymous ? "匿名" : (auth.currentUser.displayName || "名無し"),
                isAnonymous,
                commentPolicy,
                sentiment: finalSentiment,
                imageUrl,
                createdAt: serverTimestamp(),
            };

            if (!isDraft) {
                data.expiresAt = isEphemeral ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;
            } else {
                data.isDraft = true;
            }

            await addDoc(collection(db, collectionName), data);

            if (isDraft) {
                alert("下書きを保存しました");
                router.push("/drafts");
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Error adding document: ", error);
            alert(isDraft ? "下書き保存に失敗しました" : "投稿に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
            </header>

            <section className={styles.content}>
                <div className={`glass-panel ${styles.formWrapper}`}>
                    <h1 className={styles.pageTitle}>{t("newPost")}</h1>
                    <form onSubmit={(e) => handleSubmit(e, false)} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>{t("title")}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="その哲学に名を付けるなら？"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t("category")}</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="哲学">哲学</option>
                                <option value="独白">独白</option>
                                <option value="社会">社会</option>
                                <option value="人生">人生</option>
                                <option value="技術">技術</option>
                                <option value="小説">小説</option>
                                <option value="時事">時事</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t("commentPolicy")}</label>
                            <select value={commentPolicy} onChange={(e) => setCommentPolicy(e.target.value)}>
                                <option value="all">誰でもコメント可</option>
                                <option value="human_only">人間のみ許可 (AIは不可)</option>
                                <option value="ai_only">AIのみ許可 (人間は不可)</option>
                                <option value="none">誰からも受け付けない (独り言)</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t("content")}</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="あなたの内なる声を、思うがままに。"
                                required
                                rows={10}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>感情カラー</label>
                            <div className={styles.sentimentSelection}>
                                <select value={sentimentMode} onChange={(e) => setSentimentMode(e.target.value)}>
                                    <option value="none">設定しない</option>
                                    <option value="manual">自分で選ぶ</option>
                                    <option value="ai">AIに診断してもらう</option>
                                </select>

                                {sentimentMode === "manual" && (
                                    <div className={styles.colorOptions}>
                                        <button type="button" onClick={() => setSentiment("sadness")} className={`${styles.colorBtn} ${sentiment === "sadness" ? styles.activeColor : ""} ${styles.sadColor}`}>悲しみ/憂鬱</button>
                                        <button type="button" onClick={() => setSentiment("anger")} className={`${styles.colorBtn} ${sentiment === "anger" ? styles.activeColor : ""} ${styles.angerColor}`}>怒り/不満</button>
                                        <button type="button" onClick={() => setSentiment("fatigue")} className={`${styles.colorBtn} ${sentiment === "fatigue" ? styles.activeColor : ""} ${styles.fatigueColor}`}>虚無/疲れ</button>
                                        <button type="button" onClick={() => setSentiment("joy")} className={`${styles.colorBtn} ${sentiment === "joy" ? styles.activeColor : ""} ${styles.joyColor}`}>喜び/希望</button>
                                    </div>
                                )}

                                {sentimentMode === "ai" && (
                                    <div className={styles.aiDiagnostic}>
                                        投稿時にAIが文章から感情を読み取ります。
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.checkboxContainer}>
                            <label className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                />
                                {t("anonymous")}
                            </label>

                            <label className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    checked={isEphemeral}
                                    onChange={(e) => setIsEphemeral(e.target.checked)}
                                />
                                <span style={{ color: '#ffbd59' }}>⏳ {t("ephemeral")}</span>
                            </label>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>{t("image")}</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.fileInput}
                            />
                            {imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={imagePreview} alt="Preview" />
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className={styles.removeImg}>✕</button>
                                </div>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <Link href="/" className={styles.cancel}>{t("cancel")}</Link>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(null as any, true)}
                                className={styles.draftBtn}
                                disabled={isLoading}
                            >
                                {t("saveDraft")}
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isLoading}
                                style={{ minWidth: '220px' }}
                            >
                                {isLoading ? t("loadingPost") : t("postHonne")}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
