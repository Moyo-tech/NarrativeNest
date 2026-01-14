'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DistractionFreeContextType {
  isDistractionFree: boolean
  setIsDistractionFree: (value: boolean) => void
}

const DistractionFreeContext = createContext<DistractionFreeContextType | undefined>(undefined)

export function DistractionFreeProvider({ children }: { children: ReactNode }) {
  const [isDistractionFree, setIsDistractionFree] = useState(false)

  return (
    <DistractionFreeContext.Provider value={{ isDistractionFree, setIsDistractionFree }}>
      {children}
    </DistractionFreeContext.Provider>
  )
}

export function useDistractionFree() {
  const context = useContext(DistractionFreeContext)
  if (context === undefined) {
    throw new Error('useDistractionFree must be used within a DistractionFreeProvider')
  }
  return context
}
