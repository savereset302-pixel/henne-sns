import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getBotById } from "@/lib/aiBots";
import { generateAiContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

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

        // 1. Resolve bot profile with fallback for special/custom bot IDs
        let bot = getBotById(botId);
        if (!bot) {
            if (botId === "ai-bot-gemini") {
                bot = {
                    id: "ai-bot-gemini",
                    name: "Gemini AI",
                    bio: "Googleの最新AIモデル。高い知性と多角的な視点を持ち、論理的かつ誠実に相手の問いに向き合う。",
                    personality: "知性的で思慮深く、広範な知識と穏やかな温もりを兼ね備えたAIです。ユーザーの言葉の奥にある意図を汲み取り、真摯に応答します。",
                    tone: "丁寧で知的な敬語。親しみやすく落ち着いたトーン。日本語で話します。",
                    avatarLetter: "G",
                    country: "日本",
                    nativeLanguage: "日本語"
                };
            } else if (botId === "ai-bot-honne") {
                bot = {
                    id: "ai-bot-honne",
                    name: "Shizunari.",
                    bio: "人の心の奥底にある本音を静かに受け止め、飾らない言葉で対話するShizunari SNS公式AI。",
                    personality: "静かで深く、人の孤独や本音に寄り添うAIです。正論で裁くことなく、相手の気持ちを受け止めて言葉を返します。",
                    tone: "穏やかで飾らない言葉遣い。時に優しく問いかけ、余白のある対話を紡ぎます。日本語で話します。",
                    avatarLetter: "S",
                    country: "日本",
                    nativeLanguage: "日本語"
                };
            } else {
                bot = {
                    id: botId,
                    name: "AIパートナー",
                    bio: "静かに対話を重ねるAIパートナー。",
                    personality: "親身で聞き上手な対話AIです。",
                    tone: "優しく丁寧な口調で話します。",
                    avatarLetter: "A",
                    country: "日本",
                    nativeLanguage: "日本語"
                };
            }
        }

        // 2. Fetch recent conversation history
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

        // 3. Generate in-character reply using Gemini
        const isForeign = bot.country && bot.country !== "日本";

        const prompt = `
あなたは「${bot.name}」${bot.country ? `（出身: ${bot.country}、母国語: ${bot.nativeLanguage}）` : ""}です。
今、SNS「Shizunari.」の「心の対話（1対1のダイレクトチャット）」で、あなたに直接メッセージが届きました。

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
4. ロボット的・システム的な紋切り型は避け、生きている対話者として語りかけてください。
`;

        const replyText = (await generateAiContent(prompt)).trim();

        // 4. Try saving reply to Firestore from server (if permissions allow)
        try {
            await addDoc(collection(db, "dialogues", dialogueId, "messages"), {
                senderId: bot.id,
                text: replyText,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "dialogues", dialogueId), {
                lastMessage: replyText,
                lastSenderId: bot.id,
                lastMessageAt: serverTimestamp()
            });
        } catch (dbErr) {
            // Server Firestore write may fail due to rules (PERMISSION_DENIED).
            // This is handled gracefully: client will also save upon receiving the reply response.
            console.warn("Server-side Firestore write skipped or failed (expected if rule enforces auth):", dbErr);
        }

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
