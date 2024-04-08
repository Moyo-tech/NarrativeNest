import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TitleContextType {
  generatedTitle: string;
  updateGeneratedTitle: (newTitle: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

interface TitleProviderProps {
  children: ReactNode;
}

export const TitleProvider: React.FC<TitleProviderProps> = ({ children }) => {
  const [generatedTitle, setGeneratedTitle] = useState<string>('');

  const updateGeneratedTitle = (newTitle: string) => {
    setGeneratedTitle(newTitle);
  };

  return (
    <TitleContext.Provider value={{ generatedTitle, updateGeneratedTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useGeneratedTitle = (): string => {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error('useGeneratedTitle must be used within a TitleProvider');
  }
  return context.generatedTitle;
};

export const useUpdateGeneratedTitle = (): ((newTitle: string) => void) => {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error('useUpdateGeneratedTitle must be used within a TitleProvider');
  }
  return context.updateGeneratedTitle;
};
