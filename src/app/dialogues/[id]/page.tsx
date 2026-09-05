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
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState("");
    const [otherUser, setOtherUser] = useState<any>(null);
    const [otherUserId, setOtherUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
                        const bot = getBotById(otherId);
                        if (bot) {
                            setOtherUser({
                                displayName: bot.name,
                                bio: bot.bio,
                                isAi: true
                            });
                        }
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
                router.push("/dialogues");
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
                fetch("/api/dialogue-ai-reply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dialogueId: id,
                        botId: otherUserId,
                        userMessage: text
                    })
                }).catch(err => {
                    console.error("AI reply error:", err);
                }).finally(() => {
                    setIsAiTyping(false);
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) return <div className="container">{t("loadingPosts")}</div>;

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/dialogues" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>← {t("dialogue_list")}</Link>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {otherUser?.isAi && <span style={{ fontSize: '0.75rem', background: 'var(--accent-color)', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>AI</span>}
                    {otherUser?.displayName || "対話"}
                </div>
                <UserNav />
            </header>

            <div className={styles.chatContainer}>
                <div className={styles.messageList} ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={msg.senderId === user?.uid ? styles.myMessage : styles.otherMessage}
                        >
                            <div className={styles.bubble}>
                                {msg.text}
                            </div>
                            <div className={styles.time}>
                                {msg.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
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
