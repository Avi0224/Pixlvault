"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

export default function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAdmin } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Hardcode admin check or fetch from Firestore. 
      // For now, if the user matches a specific UID from env, they are admin.
      if (user && user.uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAdmin]);

  return <>{children}</>;
}
