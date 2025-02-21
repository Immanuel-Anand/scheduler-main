import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import CreateEventDrawer from "../components/create-event";
import { Toaster } from "../components/ui/toaster";
import { Suspense } from "react"; 

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Scheduler",
  description: "Meeting Scheduling App",
};

export default function RootLayout({ children }) {
  return (
    // This will suppress the hydration warning
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <Suspense fallback={<div>Loading...</div>}>
            
            {children}
            </Suspense>
  
          </main>
          <Toaster position="top-right" />
          <CreateEventDrawer />

        </ClerkProvider>
      </body>
    </html>
  );
}
