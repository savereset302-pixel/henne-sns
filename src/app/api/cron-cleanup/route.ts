import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";

export async function GET() {
    try {
        console.log("Starting cleanup job...");

        const postsRef = collection(db, "posts");
        const now = Timestamp.now();

        // Query posts where expiresAt < now
        const q = query(postsRef, where("expiresAt", "<=", now));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No expired posts found.");
            return NextResponse.json({ success: true, message: "No expired posts found", deletedCount: 0 });
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        console.log(`Deleted ${snapshot.size} expired posts.`);

        return NextResponse.json({
            success: true,
            message: "Cleanup completed",
            deletedCount: snapshot.size
        });

    } catch (error: any) {
        console.error("Error in cleanup job:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
