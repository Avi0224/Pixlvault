import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FirebaseAuthProvider from "@/components/FirebaseAuthProvider";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pixlvault - Photography Portfolio",
  description: "A breathtaking 3D showcase and gallery of exceptional photography.",
  icons: {
    icon: '/logo.png',
  }
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
