import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import { ChallengeProvider } from "@/contexts/ChallengeContext"
import { NotificationSystem } from "@/components/NotificationSystem"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'WordBattle',
  description: 'Challenge your friends to epic word battles in real-time',
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 's8W_-cpKTTT9lY7V9WzFqiswKo6kRU4fKiDtTt48jIo',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-zinc-900`}>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <ChallengeProvider>
              <NotificationSystem />
              <div className="flex-1 flex flex-col items-center justify-center">
                {children}
              </div>
            </ChallengeProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
