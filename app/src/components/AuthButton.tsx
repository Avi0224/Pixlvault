"use client";
import { useStore } from "@/store/useStore";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export default function AuthButton() {
  const { user } = useStore();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-gray-600" />
          )}
          <span className="text-lg">{user.displayName}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="px-6 py-2 border border-white/20 rounded hover:bg-white/10 transition-colors text-sm tracking-wider uppercase"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="px-8 py-3 bg-white text-black rounded font-medium hover:bg-gray-200 transition-colors tracking-wide"
    >
      Continue with Google
    </button>
  );
}
