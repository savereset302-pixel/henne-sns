"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import styles from "../chat.module.css";
import { getBotById } from "@/lib/aiBots";

interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: any;
}

export default function DialogueChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState("");
    const [otherUser, setOtherUser] = useState<any>(null);
    const [otherUserId, setOtherUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [translatedMsgs, setTranslatedMsgs] = useState<Record<string, string>>({});
    const [msgTranslating, setMsgTranslating] = useState<Record<string, boolean>>({});
    const [showOriginalMsgs, setShowOriginalMsgs] = useState<Record<string, boolean>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleTranslateMessage = async (msg: Message) => {
        if (translatedMsgs[msg.id]) {
            setShowOriginalMsgs(prev => ({ ...prev, [msg.id]: !prev[msg.id] }));
            return;
        }

        setMsgTranslating(prev => ({ ...prev, [msg.id]: true }));
        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texts: [{ id: msg.id, title: "", content: msg.text }],
                    targetLang: language
                })
            });
            const data = await res.json();
            if (data.success && data.translatedItems && data.translatedItems[0]) {
                setTranslatedMsgs(prev => ({ ...prev, [msg.id]: data.translatedItems[0].content }));
                setShowOriginalMsgs(prev => ({ ...prev, [msg.id]: false }));
            }
        } catch (e) {
            console.error("Message translation failed:", e);
        } finally {
            setMsgTranslating(prev => ({ ...prev, [msg.id]: false }));
        }
    };

    useEffect(() => {
        if (!id || !user) return;

        const fetchChatInfo = async () => {
            const chatRef = doc(db, "dialogues", id as string);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) {
                const data = chatSnap.data();
                const otherId = data.participants.find((p: string) => p !== user.uid);
                if (otherId) {
                    setOtherUserId(otherId);
                    const userSnap = await getDoc(doc(db, "users", otherId));
                    if (userSnap.exists()) {
                        setOtherUser(userSnap.data());
                    } else {
                        let botName = "AIパートナー";
                        let botBio = "";
                        if (otherId === "ai-bot-gemini") {
                            botName = "Gemini AI";
                            botBio = "Googleの対話AI";
                        } else if (otherId === "ai-bot-honne") {
                            botName = "Shizunari.";
                            botBio = "静寂と本音の対話AI";
                        } else {
                            const bot = getBotById(otherId);
                            if (bot) {
                                botName = bot.name;
                                botBio = bot.bio;
                            }
                        }
                        setOtherUser({
                            displayName: botName,
                            bio: botBio,
                            isAi: true
                        });
                    }
                }

                // Mark conversation as read by this user
                try {
                    await updateDoc(chatRef, {
                        [`readBy.${user.uid}`]: serverTimestamp()
                    });
                } catch (readErr) {
                    console.warn("Could not mark readBy:", readErr);
                }
            } else {
                router.push("/inbox");
            }
        };

        fetchChatInfo();

        const q = query(
            collection(db, "dialogues", id as string, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, user, router]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAiTyping]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMsg.trim() || !user || !id) return;

        const text = newMsg;
        setNewMsg("");

        try {
            await addDoc(collection(db, "dialogues", id as string, "messages"), {
                senderId: user.uid,
                text,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "dialogues", id as string), {
                lastMessage: text,
                lastSenderId: user.uid,
                lastMessageAt: serverTimestamp(),
                [`readBy.${user.uid}`]: serverTimestamp()
            });

            // If other user is an AI bot, trigger AI auto-reply
            const isBot = otherUserId?.startsWith("ai-bot-") || otherUser?.isAi;
            if (isBot && otherUserId) {
                setIsAiTyping(true);
                try {
                    const res = await fetch("/api/dialogue-ai-reply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            dialogueId: id,
                            botId: otherUserId,
                            userMessage: text
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.reply) {
                        // Persist reply in Firestore from authenticated client to ensure permission compliance
                        await addDoc(collection(db, "dialogues", id as string, "messages"), {
                            senderId: otherUserId,
                            text: data.reply,
                            createdAt: serverTimestamp()
                        });

                        await updateDoc(doc(db, "dialogues", id as string), {
                            lastMessage: data.reply,
                            lastSenderId: otherUserId,
                            lastMessageAt: serverTimestamp(),
                            [`readBy.${user.uid}`]: serverTimestamp()
                        });
                    }
                } catch (replyErr) {
                    console.error("AI reply fetch error:", replyErr);
                } finally {
                    setIsAiTyping(false);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) return <div className="container">{t("loadingPosts")}</div>;

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/inbox" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>← 📬 {t("dialogue_list")}</Link>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {otherUser?.isAi && <span style={{ fontSize: '0.75rem', background: 'var(--accent-color)', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>AI</span>}
                    {otherUser?.displayName || "対話"}
                </div>
                <UserNav />
            </header>

            <div className={styles.chatContainer}>
                <div className={styles.messageList} ref={scrollRef}>
                    {messages.map((msg) => {
                        const isMine = msg.senderId === user?.uid;
                        const translated = translatedMsgs[msg.id];
                        const isShowingOriginal = showOriginalMsgs[msg.id];
                        const isShowingTranslation = translated && !isShowingOriginal;
                        const isForeign = !isMine && (language !== "ja" || !/[\u3040-\u309F]/.test(msg.text));

                        return (
                            <div
                                key={msg.id}
                                className={isMine ? styles.myMessage : styles.otherMessage}
                            >
                                <div className={styles.bubble}>
                                    {isShowingTranslation ? (
                                        <>
                                            <div>{translated}</div>
                                            <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '5px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                                                {msg.text}
                                            </div>
                                        </>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                    <span className={styles.time}>
                                        {msg.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isForeign && (
                                        <button
                                            type="button"
                                            onClick={() => handleTranslateMessage(msg)}
                                            disabled={msgTranslating[msg.id]}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--accent-color)',
                                                fontSize: '0.72rem',
                                                cursor: 'pointer',
                                                padding: '1px 4px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                opacity: msgTranslating[msg.id] ? 0.6 : 0.9
                                            }}
                                        >
                                            <span>🌐</span>
                                            {msgTranslating[msg.id]
                                                ? "翻訳中..."
                                                : isShowingTranslation
                                                    ? "原文のみ"
                                                    : (language === "ja" ? "日本語訳" : t("translatePost"))}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isAiTyping && (
                        <div className={styles.otherMessage} style={{ opacity: 0.8 }}>
                            <div className={styles.bubble} style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.06)' }}>
                                💭 {otherUser?.displayName || "AI"} が思索中...
                            </div>
                        </div>
                    )}
                </div>

                <form className={styles.inputArea} onSubmit={sendMessage}>
                    <input
                        type="text"
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        placeholder={t("dialogue_placeholder")}
                        className={styles.input}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                        {t("dialogue_send")}
                    </button>
                </form>
            </div>
        </main>
    );
}
