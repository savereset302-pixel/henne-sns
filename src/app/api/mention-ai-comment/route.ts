import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getBotById, AI_BOTS } from "@/lib/aiBots";
import { generateAiContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const body = await request.json();
        const { postId, botId, botName, userCommentText, userName, userId } = body;

        if (!postId || (!botId && !botName)) {
            return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
        }

        // Find bot by id or name
        let bot = botId ? getBotById(botId) : null;
        if (!bot && botName) {
            bot = AI_BOTS.find(b => b.name === botName || b.name.includes(botName) || botName.includes(b.name)) || null;
        }

        if (!bot) {
            return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 });
        }

        // Fetch post info
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists()) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }
        const postData = postSnap.data();

        const isForeign = bot.country && bot.country !== "日本";

        const prompt = `あなたは「${bot.name}」${bot.country ? `（出身: ${bot.country}、母国語: ${bot.nativeLanguage}）` : ""}です。
SNS「Shizunari.」の投稿に対するコメント欄で、ユーザー（${userName || "名無し"}）から「@${bot.name}」とメンション（名指し呼び出し）されました。

【投稿のタイトル】
${postData.title || "無題"}

【投稿の本文】
${postData.content || ""}

【メンションされたユーザーのコメント】
「${userCommentText}」

【あなたの人物像・背景】
${bot.bio}

【あなたの性格】
${bot.personality}

【話し方・口調】
${bot.tone}

【返信ルール】
1. メンションしてくれたユーザー（${userName || "あなた"}）のコメント内容を的確に踏まえ、あなたのキャラクターならではの視点・哲学・感情を込めて返信してください。
2. ${isForeign ? `必ずあなたの母国語（${bot.nativeLanguage}）で返信してください（翻訳や解説は不要です）。` : "自然な日本語の口調で返信してください。"}
3. 長さは40〜120文字程度で、コメント本文のみを出力してください（話者名やカギ括弧は不要です）。
4. 「AIとして〜」といった前置きや定型文は絶対に含めないでください。`;

        const replyText = (await generateAiContent(prompt)).trim();

        // 1. Add comment to post comments
        const commentRef = await addDoc(collection(db, "posts", postId, "comments"), {
            text: replyText,
            authorName: bot.name,
            authorId: bot.id,
            isAi: true,
            createdAt: serverTimestamp(),
            replyToUser: userName || "ユーザー"
        });

        // 2. Increment post commentCount
        await updateDoc(postRef, {
            commentCount: increment(1)
        });

        // 3. Send notification to the user who mentioned the bot (if userId provided)
        if (userId) {
            try {
                await addDoc(collection(db, "users", userId, "notifications"), {
                    type: "mention",
                    postId,
                    postTitle: postData.title || "無題の本音",
                    senderName: bot.name,
                    senderId: bot.id,
                    senderIsAi: true,
                    text: replyText,
                    createdAt: serverTimestamp(),
                    read: false
                });
            } catch (notifErr) {
                console.warn("Could not create mention notification:", notifErr);
            }
        }

        return NextResponse.json({
            success: true,
            comment: {
                id: commentRef.id,
                text: replyText,
                authorName: bot.name,
                authorId: bot.id,
                isAi: true
            }
        });
    } catch (error: any) {
        console.error("Mention AI Comment Error:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
