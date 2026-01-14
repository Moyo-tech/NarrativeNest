'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { UserPlugin, PluginState, SAMPLE_PLUGINS } from '@/types/plugin';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'narrativenest-user-plugins';

// Action types
type PluginAction =
  | { type: 'SET_PLUGINS'; payload: UserPlugin[] }
  | { type: 'ADD_PLUGIN'; payload: UserPlugin }
  | { type: 'UPDATE_PLUGIN'; payload: { id: string; updates: Partial<UserPlugin> } }
  | { type: 'DELETE_PLUGIN'; payload: { id: string } }
  | { type: 'TOGGLE_PLUGIN'; payload: { id: string } }
  | { type: 'IMPORT_PLUGINS'; payload: UserPlugin[] }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: PluginState = {
  plugins: [],
  isLoading: true,
};

// Reducer
function pluginReducer(state: PluginState, action: PluginAction): PluginState {
  switch (action.type) {
    case 'SET_PLUGINS':
      return { ...state, plugins: action.payload, isLoading: false };

    case 'ADD_PLUGIN':
      return { ...state, plugins: [...state.plugins, action.payload] };

    case 'UPDATE_PLUGIN': {
      const { id, updates } = action.payload;
      return {
        ...state,
        plugins: state.plugins.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        ),
      };
    }

    case 'DELETE_PLUGIN':
      return {
        ...state,
        plugins: state.plugins.filter((p) => p.id !== action.payload.id),
      };

    case 'TOGGLE_PLUGIN':
      return {
        ...state,
        plugins: state.plugins.map((p) =>
          p.id === action.payload.id ? { ...p, enabled: !p.enabled, updatedAt: Date.now() } : p
        ),
      };

    case 'IMPORT_PLUGINS': {
      // Merge imported plugins, replacing existing ones with same ID
      const existingIds = new Set(state.plugins.map((p) => p.id));
      const newPlugins = action.payload.filter((p) => !existingIds.has(p.id));
      const updatedPlugins = state.plugins.map((existing) => {
        const imported = action.payload.find((p) => p.id === existing.id);
        return imported || existing;
      });
      return {
        ...state,
        plugins: [...updatedPlugins, ...newPlugins],
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// Context types
interface PluginContextValue {
  plugins: UserPlugin[];
  enabledPlugins: UserPlugin[];
  isLoading: boolean;
  addPlugin: (plugin: Omit<UserPlugin, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlugin: (id: string, updates: Partial<UserPlugin>) => void;
  deletePlugin: (id: string) => void;
  togglePlugin: (id: string) => void;
  importPlugins: (plugins: UserPlugin[]) => void;
  exportPlugins: () => UserPlugin[];
  loadSamplePlugins: () => void;
}

// Create context
const PluginContext = createContext<PluginContextValue | undefined>(undefined);

// Provider component
export function PluginProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pluginReducer, initialState);

  // Load plugins from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const plugins = JSON.parse(stored) as UserPlugin[];
        dispatch({ type: 'SET_PLUGINS', payload: plugins });
      } else {
        dispatch({ type: 'SET_PLUGINS', payload: [] });
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
      dispatch({ type: 'SET_PLUGINS', payload: [] });
    }
  }, []);

  // Save plugins to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plugins));
      } catch (error) {
        console.error('Failed to save plugins:', error);
      }
    }
  }, [state.plugins, state.isLoading]);

  const addPlugin = useCallback(
    (plugin: Omit<UserPlugin, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newPlugin: UserPlugin = {
        ...plugin,
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_PLUGIN', payload: newPlugin });
    },
    []
  );

  const updatePlugin = useCallback((id: string, updates: Partial<UserPlugin>) => {
    dispatch({ type: 'UPDATE_PLUGIN', payload: { id, updates } });
  }, []);

  const deletePlugin = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PLUGIN', payload: { id } });
  }, []);

  const togglePlugin = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_PLUGIN', payload: { id } });
  }, []);

  const importPlugins = useCallback((plugins: UserPlugin[]) => {
    dispatch({ type: 'IMPORT_PLUGINS', payload: plugins });
  }, []);

  const exportPlugins = useCallback(() => {
    return state.plugins;
  }, [state.plugins]);

  const loadSamplePlugins = useCallback(() => {
    // Add sample plugins that don't already exist
    const existingIds = new Set(state.plugins.map((p) => p.id));
    const newSamples = SAMPLE_PLUGINS.filter((s) => !existingIds.has(s.id));
    if (newSamples.length > 0) {
      dispatch({ type: 'IMPORT_PLUGINS', payload: newSamples });
    }
  }, [state.plugins]);

  const enabledPlugins = state.plugins.filter((p) => p.enabled);

  const value: PluginContextValue = {
    plugins: state.plugins,
    enabledPlugins,
    isLoading: state.isLoading,
    addPlugin,
    updatePlugin,
    deletePlugin,
    togglePlugin,
    importPlugins,
    exportPlugins,
    loadSamplePlugins,
  };

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}

// Hook to use the context
export function usePlugins() {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
}
