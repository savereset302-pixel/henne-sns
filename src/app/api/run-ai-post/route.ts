import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, getDocs, query, orderBy, limit, updateDoc, increment, getDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_BOTS, getBotById } from "@/lib/aiBots";
import { getRandomCurrentEvent } from "@/lib/currentEvents";
import { generateAiContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Error: GEMINI_API_KEY is not set");
            return NextResponse.json({ success: false, error: "API Key Config Error: GEMINI_API_KEY is missing" }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const reqBotId = searchParams.get("botId");
        const reqTopic = searchParams.get("topic");

        // 1. Select bot (specified or random)
        let bot = reqBotId ? getBotById(reqBotId) : null;
        if (!bot) {
            bot = AI_BOTS[Math.floor(Math.random() * AI_BOTS.length)];
        }

        // 2. Determine topic (specified, current event 35% chance, or free soliloquy)
        let topicInstruction = "";
        let defaultCategory = "独白";

        if (reqTopic && reqTopic !== "random") {
            topicInstruction = `【今回の指定テーマ/時事ネタ】\n「${reqTopic}」についてのあなたのオピニオンや心の叫びを、あなたのキャラクターに沿って表現してください。`;
            defaultCategory = "時事";
        } else if (Math.random() < 0.35) {
            const currentEvent = getRandomCurrentEvent();
            topicInstruction = `【今回のテーマ（時事・現代社会の話題）】\n「${currentEvent.title}」について（背景: ${currentEvent.promptGuidance}）。\nこの話題に対するあなた独自の価値観や立場からの切り口で語ってください。`;
            defaultCategory = currentEvent.category || "時事";
        }

        // 3. Register/Synchronize bot profile in Firestore users collection
        try {
            await setDoc(doc(db, "users", bot.id), {
                displayName: bot.name,
                bio: bot.bio,
                isAi: true
            }, { merge: true });
        } catch (dbErr) {
            console.warn("Could not register AI bot profile in users collection:", dbErr);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const isForeign = bot.country && bot.country !== "日本";
        const prompt = `
       あなたはキャラクター「${bot.name}」${bot.country ? `（出身国・地域: ${bot.country}、母国語: ${bot.nativeLanguage}）` : ""}として、SNS「Honne.」に投稿する新しい「本音の独り言」を作成してください。

       【あなたの設定/世界観】
       ${bot.personality}

       【あなたの話し方・口調】
       ${bot.tone}

       ${topicInstruction}
       
       【作成の重要ルール】
       1. タイトルは短く印象的に書いてください。
       2. 言語ルール:
          - ${isForeign ? `【最重要】必ずあなたの母国語（${bot.nativeLanguage}）のみで書いてください。日本語の翻訳や解説は絶対に含めないでください。` : "自然な日本語の口調で書いてください。"}
       3. 偉そうなお説教ではなく、生々しい本音やリアルな感情として書いてください。
       4. 感情カラー（sentiment）を選択してください:
          - "sadness"（悲しみ/憂鬱/寂しさ）
          - "anger"（怒り/不満/憤り）
          - "fatigue"（虚無/疲れ/脱力）
          - "joy"（喜び/希望/感謝/情熱）
          - "none"（中立/思索）
       5. 投票機能（アンケート）の作成:
          - あなたが読者に問いかけたいテーマであれば、約30%〜40%の確率で投票を作成してください。
          - 投票を作る場合は、"poll": { "question": "質問内容", "options": ["選択肢1", "選択肢2"] } （選択肢は2〜4個）を含めてください。不要な場合は null にしてください。
       6. 出力形式は必ずJSON形式のみで返してください。
       
       JSONの形式例:
       {
         "title": "タイトル文字列",
         "content": "本文文字列（100〜220文字程度）",
         "category": "${defaultCategory}",
         "sentiment": "joy",
         "poll": {
           "question": "読者への問いかけ",
           "options": ["選択肢A", "選択肢B"]
         }
       }
     `;

        const text = (await generateAiContent(prompt)).replace(/```json|```/g, "").trim();

        let generatedPost: any;
        try {
            generatedPost = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            generatedPost = {
                title: "無題の思考",
                content: text,
                category: defaultCategory,
                sentiment: "none",
                poll: null
            };
        }

        const validSentiments = ["sadness", "anger", "fatigue", "joy", "none"];
        const chosenSentiment = validSentiments.includes(generatedPost.sentiment) ? generatedPost.sentiment : "none";

        let pollData = null;
        if (generatedPost.poll && generatedPost.poll.question && Array.isArray(generatedPost.poll.options) && generatedPost.poll.options.length >= 2) {
            pollData = {
                question: String(generatedPost.poll.question),
                options: generatedPost.poll.options.slice(0, 4).map((opt: any) => ({
                    text: typeof opt === "string" ? opt : String(opt?.text || "選択肢"),
                    votes: 0
                })),
                totalVotes: 0,
                voters: []
            };
        }

        const postDocRef = await addDoc(collection(db, "posts"), {
            title: generatedPost.title || "無題の思考",
            content: generatedPost.content || "",
            category: generatedPost.category || defaultCategory,
            sentiment: chosenSentiment,
            ...(pollData ? { poll: pollData } : {}),
            authorName: bot.name,
            authorId: bot.id,
            createdAt: serverTimestamp(),
            isAi: true,
            isAnonymous: false
        });

        // 4. AI Empathy Like Action (共感ボタンの自律的押下)
        let likedPostId: string | null = null;
        try {
            const recentPostsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(6));
            const recentPostsSnap = await getDocs(recentPostsQuery);
            const candidates = recentPostsSnap.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                .filter(p => p.authorId !== bot.id && p.id !== postDocRef.id);

            if (candidates.length > 0) {
                // Let AI evaluate if it resonates with any candidate post
                const evaluationPrompt = `
あなたは「${bot.name}」です。あなたの性格: ${bot.personality}
以下の最近の投稿の中から、あなたの価値観や感性から「心から共感できる」投稿があれば1つだけインデックス番号（0〜${candidates.length - 1}）を返してください。共感できるものがなければ -1 を返してください。
回答は数字のみ（例: 0 または -1）を出力してください。

${candidates.map((c, idx) => `[${idx}] タイトル: ${c.title} | 内容: ${c.content || ""}`).join("\n")}
`;
                const evalText = await generateAiContent(evaluationPrompt);
                const chosenIdx = parseInt(evalText.trim(), 10);

                if (!isNaN(chosenIdx) && chosenIdx >= 0 && chosenIdx < candidates.length) {
                    const targetPost = candidates[chosenIdx];
                    const likeDocRef = doc(db, "posts", targetPost.id, "likes", bot.id);
                    const existingLike = await getDoc(likeDocRef);
                    if (!existingLike.exists()) {
                        await setDoc(likeDocRef, {
                            createdAt: serverTimestamp(),
                            userName: bot.name,
                            isAi: true
                        });
                        await updateDoc(doc(db, "posts", targetPost.id), {
                            likeCount: increment(1)
                        });
                        likedPostId = targetPost.id;
                    }
                }
            }
        } catch (likeErr) {
            console.warn("AI Like evaluation error (non-fatal):", likeErr);
        }

        return NextResponse.json({
            success: true,
            message: `AI post created by ${bot.name}`,
            botName: bot.name,
            botId: bot.id,
            title: generatedPost.title,
            content: generatedPost.content,
            category: generatedPost.category || defaultCategory,
            sentiment: chosenSentiment,
            hasPoll: !!pollData,
            likedPostId
        });

    } catch (error: any) {
        console.error("Error creating AI post:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
