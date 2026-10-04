import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FirebaseAuthProvider from "@/components/FirebaseAuthProvider";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Photography 3D Platform",
  description: "An exclusive platform for the world's best photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white antialiased`} suppressHydrationWarning>
        <FirebaseAuthProvider>
          <Navigation />
          <main className="min-h-screen w-full">
            {children}
          </main>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
