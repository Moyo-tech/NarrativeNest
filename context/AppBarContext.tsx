import React, { createContext, useContext, ReactNode, useState } from 'react';

interface BreadcrumbItem {
  name: string;
  link: string;
}

interface AppBarContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: React.Dispatch<React.SetStateAction<BreadcrumbItem[]>>;
  secondaryOptions: React.ReactNode | null;
  setSecondaryOptions: React.Dispatch<React.SetStateAction<React.ReactNode | null>>;
}

const defaultValue: AppBarContextType = {
  breadcrumbs: [],
  setBreadcrumbs: () => {},
  secondaryOptions: null,
  setSecondaryOptions: () => {},
};

const AppBarContext = createContext<AppBarContextType>(defaultValue);

export const useAppBarContext = () => useContext(AppBarContext);

interface AppBarProviderProps {
  children: ReactNode;
}

export const AppBarProvider: React.FC<AppBarProviderProps> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [secondaryOptions, setSecondaryOptions] = useState<React.ReactNode | null>(null);

  return (
    <AppBarContext.Provider value={{ breadcrumbs, setBreadcrumbs, secondaryOptions, setSecondaryOptions }}>
      {children}
    </AppBarContext.Provider>
  );
};
