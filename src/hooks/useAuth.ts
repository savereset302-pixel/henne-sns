"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export type AuthUser = User & {
    isAdmin?: boolean;
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

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    isAdmin = data.isAdmin || false;
                } else {
                    // Create user document if it doesn't exist
                    await setDoc(userRef, {
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        createdAt: new Date(),
                        isAdmin: false
                    });
                }

                setUser({ ...firebaseUser, isAdmin });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
