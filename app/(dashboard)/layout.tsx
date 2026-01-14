import { ReactNode } from 'react'
import Shell from '@/components/layout/Shell'
import { DistractionFreeProvider } from '@/context/DistractionFreeContext'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DistractionFreeProvider>
      <Shell>{children}</Shell>
    </DistractionFreeProvider>
  )
}
