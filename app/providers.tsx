'use client'

import { TitleProvider } from '@/context/TitleContext'
import { AppBarProvider } from '@/context/AppBarContext'
import { ToastProvider } from '@/context/ToastContext'
import { ToastContainer } from '@/components/ui/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppBarProvider>
        <TitleProvider>
          {children}
          <ToastContainer />
        </TitleProvider>
      </AppBarProvider>
    </ToastProvider>
  )
}
