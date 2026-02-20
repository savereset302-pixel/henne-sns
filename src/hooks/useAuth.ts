"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export type AuthUser = User & {
    isAdmin?: boolean;
    theme?: string;
};

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch extra data from Firestore
                const { db } = await import("@/lib/firebase");
                const { doc, getDoc, setDoc } = await import("firebase/firestore");

                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                let isAdmin = false;
                let theme = "dark";

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    isAdmin = data.isAdmin || false;
                    theme = data.theme || "dark";
                } else {
                    // Create user document if it doesn't exist
                    await setDoc(userRef, {
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        createdAt: new Date(),
                        isAdmin: false,
                        theme: "dark"
                    });
                }

                setUser({ ...firebaseUser, isAdmin, theme });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
