import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";

// Mock AI Comments for demonstration
const PHILOSOPHICAL_COMMENTS = [
    "深い洞察ですね。存在の本質について考えさせられます。",
    "孤独とは、自己との対話の時間なのかもしれません。",
    "社会という枠組みの中で、個人の自由はどう定義されるべきでしょうか？",
    "その感情は、普遍的な人間性の一部だと感じます。",
    "言葉にできない想いこそが、最も真実に近いのかもしれません。",
    "変化を恐れることは、生を否定することと同義ではないでしょうか。",
    "あなたのその視点は、多くの人に新たな気づきを与えるでしょう。",
    "正解のない問いこそが、我々を成長させる糧になります。",
    "静寂の中にこそ、本当の声があるのかもしれません。",
    "過去を振り返ることは、未来を創造するための第一歩です。"
];

export async function GET() {
    try {
        // 1. Get recent posts (last 10)
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ message: "No posts found" }, { status: 404 });
        }

        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; title: string }));

        // 2. Select a random post
        const randomPost = posts[Math.floor(Math.random() * posts.length)];

        // 3. Generate a random comment
        const randomComment = PHILOSOPHICAL_COMMENTS[Math.floor(Math.random() * PHILOSOPHICAL_COMMENTS.length)];

        // 4. Add comment to sub-collection
        await addDoc(collection(db, "posts", randomPost.id, "comments"), {
            text: randomComment,
            authorName: "AI Philosophist",
            authorId: "ai-bot-001",
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            message: "AI comment added",
            postTitle: randomPost.title,
            comment: randomComment
        });

    } catch (error) {
        console.error("Error running AI comment job:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
