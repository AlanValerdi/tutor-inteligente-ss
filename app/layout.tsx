import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { SWRProvider } from '@/components/providers/swr-provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'LearnFlow LMS - Plataforma de Aprendizaje Adaptativo',
  description: 'Un sistema de gestion de aprendizaje adaptativo moderno con perfiles de estudio personalizados, evaluaciones diagnosticas y analitica estudiantil en tiempo real.',
}

export const viewport: Viewport = {
  themeColor: '#2a9d7c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <SWRProvider>
          {children}
        </SWRProvider>
      </body>
    </html>
  )
}
