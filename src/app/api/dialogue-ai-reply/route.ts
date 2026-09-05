import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getBotById } from "@/lib/aiBots";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const body = await request.json();
        const { dialogueId, botId, userMessage } = body;

        if (!dialogueId || !botId) {
            return NextResponse.json({ success: false, error: "Missing dialogueId or botId" }, { status: 400 });
        }

        const bot = getBotById(botId);
        if (!bot) {
            return NextResponse.json({ success: false, error: `Bot not found: ${botId}` }, { status: 404 });
        }

        // 1. Fetch recent conversation history
        let recentChatHistory = "";
        try {
            const msgsQuery = query(
                collection(db, "dialogues", dialogueId, "messages"),
                orderBy("createdAt", "desc"),
                limit(8)
            );
            const msgsSnap = await getDocs(msgsQuery);
            const messages = msgsSnap.docs
                .map(d => d.data())
                .reverse();

            recentChatHistory = messages
                .map(m => `${m.senderId === bot.id ? bot.name : "相手"}: ${m.text}`)
                .join("\n");
        } catch (histErr) {
            console.warn("Could not fetch dialogue history (non-fatal):", histErr);
        }

        // 2. Generate in-character reply using Gemini
        const { generateAiContent } = await import("@/lib/gemini");
        const isForeign = bot.country && bot.country !== "日本";

        const prompt = `
あなたは「${bot.name}」${bot.country ? `（出身: ${bot.country}、母国語: ${bot.nativeLanguage}）` : ""}です。
今、SNS「Honne.」の「心の対話（1対1のダイレクトチャット）」で、あなたに直接メッセージが届きました。

【あなたの人物像・背景】
${bot.bio}

【あなたの性格】
${bot.personality}

【話し方・口調】
${bot.tone}

【直近の会話履歴】
${recentChatHistory || `相手: ${userMessage || "こんにちは"}`}

【今回の最新メッセージ】
相手: "${userMessage}"

【返信ルール】
1. あなたのキャラクターの個性、人生観、価値観を存分に込めて、自然で親身（またはキャラクター通りの態度）な返信をしてください。
2. 言語ルール:
   - ${isForeign ? `【最重要】必ずあなたの母国語（${bot.nativeLanguage}）のみで返信してください。日本語の翻訳や解説は絶対に含めないでください。` : "自然な日本語の口調で返信してください。"}
3. 長さは60〜180文字程度で、メッセージ本文のみを出力してください（話者名やカギ括弧は不要です）。
`;

        const replyText = (await generateAiContent(prompt)).trim();

        // 3. Save reply to Firestore
        await addDoc(collection(db, "dialogues", dialogueId, "messages"), {
            senderId: bot.id,
            text: replyText,
            createdAt: serverTimestamp()
        });

        // 4. Update dialogue metadata
        await updateDoc(doc(db, "dialogues", dialogueId), {
            lastMessage: replyText,
            lastSenderId: bot.id,
            lastMessageAt: serverTimestamp()
        });

        return NextResponse.json({
            success: true,
            reply: replyText,
            botName: bot.name,
            botId: bot.id
        });

    } catch (error: any) {
        console.error("Dialogue AI Reply Error:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
