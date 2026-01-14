import '@/styles/globals.css'
import { Metadata } from 'next'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'NarrativeNest',
  description: 'AI Powered Screenwriting and Storyboarding Tool - Revolutionizing Nollywood Narratives',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
