'use client'

import { SWRConfig } from 'swr'
import { Toaster } from 'sonner'
import { swrConfig } from '@/lib/swr-config'

interface SWRProviderProps {
  children: React.ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'toast',
        }}
      />
    </SWRConfig>
  )
}