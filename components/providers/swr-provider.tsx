'use client'

import { SWRConfig } from 'swr'
import { Toaster } from '@/components/ui/toaster'
import { swrConfig } from '@/lib/swr-config'

interface SWRProviderProps {
  children: React.ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
      <Toaster />
    </SWRConfig>
  )
}