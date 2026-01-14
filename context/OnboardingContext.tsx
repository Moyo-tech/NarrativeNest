'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'narrativenest-onboarding';

interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  currentStep: number;
  isTourActive: boolean;
  hasDemoDocument: boolean;
}

type OnboardingAction =
  | { type: 'SET_WELCOME_SEEN' }
  | { type: 'SET_TOUR_COMPLETED' }
  | { type: 'START_TOUR' }
  | { type: 'STOP_TOUR' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_DEMO_DOCUMENT'; value: boolean }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; state: Partial<OnboardingState> };

const initialState: OnboardingState = {
  hasSeenWelcome: false,
  hasCompletedTour: false,
  currentStep: 0,
  isTourActive: false,
  hasDemoDocument: false,
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_WELCOME_SEEN':
      return { ...state, hasSeenWelcome: true };
    case 'SET_TOUR_COMPLETED':
      return { ...state, hasCompletedTour: true, isTourActive: false, currentStep: 0 };
    case 'START_TOUR':
      return { ...state, isTourActive: true, currentStep: 0 };
    case 'STOP_TOUR':
      return { ...state, isTourActive: false };
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case 'SET_DEMO_DOCUMENT':
      return { ...state, hasDemoDocument: action.value };
    case 'RESET':
      return initialState;
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface OnboardingContextValue {
  state: OnboardingState;
  setWelcomeSeen: () => void;
  setTourCompleted: () => void;
  startTour: () => void;
  stopTour: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDemoDocument: (value: boolean) => void;
  resetOnboarding: () => void;
  isFirstTimeUser: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      const toSave = {
        hasSeenWelcome: state.hasSeenWelcome,
        hasCompletedTour: state.hasCompletedTour,
        hasDemoDocument: state.hasDemoDocument,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [state.hasSeenWelcome, state.hasCompletedTour, state.hasDemoDocument]);

  const setWelcomeSeen = useCallback(() => dispatch({ type: 'SET_WELCOME_SEEN' }), []);
  const setTourCompleted = useCallback(() => dispatch({ type: 'SET_TOUR_COMPLETED' }), []);
  const startTour = useCallback(() => dispatch({ type: 'START_TOUR' }), []);
  const stopTour = useCallback(() => dispatch({ type: 'STOP_TOUR' }), []);
  const setStep = useCallback((step: number) => dispatch({ type: 'SET_STEP', step }), []);
  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const setDemoDocument = useCallback((value: boolean) => dispatch({ type: 'SET_DEMO_DOCUMENT', value }), []);
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  const isFirstTimeUser = !state.hasSeenWelcome;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setWelcomeSeen,
        setTourCompleted,
        startTour,
        stopTour,
        setStep,
        nextStep,
        prevStep,
        setDemoDocument,
        resetOnboarding,
        isFirstTimeUser,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
