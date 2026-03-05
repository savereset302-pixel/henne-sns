import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: NextRequest) {
    try {
        const { userId, language } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: "User ID required" });
        }

        // Fetch user's posts from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const postsRef = collection(db, "posts");
        const q = query(
            postsRef,
            where("authorId", "==", userId),
            where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
            title: doc.data().title,
            content: doc.data().content,
            sentiment: doc.data().sentiment,
            date: doc.data().createdAt?.toDate().toLocaleDateString()
        }));

        if (posts.length === 0) {
            return NextResponse.json({ success: false, error: "No posts found in the last 7 days" });
        }

        // Prepare prompt for Gemini
        const postsText = posts.map(p => `[${p.date}] ${p.title}: ${p.content} (Emotion: ${p.sentiment})`).join("\n\n");

        const prompt = `
        You are a philosophical AI analyzer for the platform "Honne SNS". 
        Analyze the following posts from a user over the last 7 days and provide a "Thought Report".
        
        Output format (JSON):
        {
          "summary": "A brief, poetic summary of the user's mental state this week.",
          "themes": ["Theme 1", "Theme 2", "Theme 3"],
          "insight": "A deep, supportive, and philosophical insight about their thoughts.",
          "advice": "A gentle suggestion for self-reflection or growth."
        }
        
        Target Language: ${language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'zh' ? 'Chinese' : 'English'}
        
        User Posts:
        ${postsText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the markdown if necessary
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const report = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!report) {
            throw new Error("Failed to parse AI response");
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("AI Report generation failed:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" });
    }
}
