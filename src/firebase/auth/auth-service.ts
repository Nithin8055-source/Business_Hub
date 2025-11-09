
'use client';
import { GoogleAuthProvider, signInWithPopup, Auth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword as signInWithEmail } from "firebase/auth";
import { ref, set, get, child } from 'firebase/database';
import type { Database } from 'firebase/database';
import { DAILY_FREE_CREDITS } from "@/lib/credits";

export async function signInWithGoogle(auth: Auth, db: Database) {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRefRtdb = ref(db, `users/${user.uid}`);
        
        const snapshot = await get(userRefRtdb);
        if (!snapshot.exists()) {
            const userProfileRtdb = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                credits: DAILY_FREE_CREDITS,
                creditsLastReset: new Date().toISOString(),
            };
            await set(userRefRtdb, userProfileRtdb);
        }

        return user;
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
    }
}

export async function signUpWithEmailAndPassword(auth: Auth, db: Database, email: string, password: string, displayName: string) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        await updateProfile(user, { displayName });

        const userRefRtdb = ref(db, `users/${user.uid}`);
        const userProfileRtdb = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            credits: DAILY_FREE_CREDITS,
            creditsLastReset: new Date().toISOString(),
        };
        await set(userRefRtdb, userProfileRtdb);

        return user;
    } catch (error) {
        console.error("Error during email/password sign-up:", error);
        throw error;
    }
}

export async function signInWithEmailAndPassword(auth: Auth, email: string, password: string) {
    try {
        const result = await signInWithEmail(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error during email/password sign-in:", error);
        throw error;
    }
}
