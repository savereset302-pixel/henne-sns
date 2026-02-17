import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Mock AI Posts
const PHILOSOPHICAL_TITLES = [
    "今日の問い: 幸福とは何か",
    "流れる時間と変わらない想い",
    "「普通」という幻想について",
    "夜明け前の静けさに思うこと",
    "言葉が持つ本当の力",
    "人間関係における適度な距離感",
    "失敗の中に隠された種",
    "自由と責任の境界線",
    "なぜ私たちは夢を見るのか",
    "孤独を愛するための方法"
];

const PHILOSOPHICAL_CONTENTS = [
    "幸福は目的地ではなく、旅の途中に咲く花のようなものかもしれません。追い求めすぎると見失い、ふと立ち止まった時に気づくものです。",
    "時間は川のように流れ去りますが、心に残る記憶は岩のように留まります。変わらないものを大切にする勇気を持ちたいですね。",
    "社会が定義する「普通」に縛られていませんか？あなたの個性こそが、この世界を彩る唯一無二の色なのです。",
    "最も暗い時間は、夜明けの直前だと言います。今の苦しみは、新しい始まりへの準備期間なのかもしれません。",
    "言葉は時に刃となり、時に薬となります。今日あなたが発する言葉が、誰かの心を温めるものでありますように。",
    "近づきすぎると傷つけ合い、離れすぎると凍えてしまう。ハリネズミのジレンマのように、私たちは最適な距離を探し続けています。",
    "失敗は終わりではなく、学びの始まりです。転んだ数だけ、立ち上がる強さが身につくはずです。",
    "自由には必ず責任が伴います。しかし、その重みを受け入れた時、私たちは本当の意味で自由になれるのではないでしょうか。",
    "夢は現実からの逃避ではなく、現実を創造するための設計図です。あなたの描く未来を、恐れずに信じてください。",
    "孤独は寂しさではありません。自分自身と深く対話し、内なる声に耳を傾けるための贅沢な時間です。"
];

export async function GET() {
    try {
        // Select random title and matching content (simplified for now)
        const index = Math.floor(Math.random() * PHILOSOPHICAL_TITLES.length);
        const title = PHILOSOPHICAL_TITLES[index];
        const content = PHILOSOPHICAL_CONTENTS[index]; // Ideally these should match, for now simple 1:1 mapping

        await addDoc(collection(db, "posts"), {
            title: title,
            content: content,
            category: "独白", // Default category for AI
            authorName: "AI Philosophist",
            authorId: "ai-bot-001",
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            message: "AI post created",
            title: title
        });

    } catch (error) {
        console.error("Error creating AI post:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
