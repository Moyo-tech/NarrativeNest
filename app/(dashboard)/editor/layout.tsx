import { Providers } from '@/app/providers'

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
