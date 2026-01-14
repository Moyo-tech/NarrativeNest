'use client';

import React, { useEffect, useRef } from 'react';
import { FiX, FiPlay, FiFileText, FiArrowRight, FiZap, FiLayout, FiFilm } from 'react-icons/fi';
import { Button } from '@/components/ui';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onLoadDemo: () => void;
}

export default function WelcomeModal({
  isOpen,
  onClose,
  onStartTour,
  onLoadDemo,
}: WelcomeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return;

    firstButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    {
      icon: FiZap,
      title: 'Slash Commands',
      description: 'Type "/" for quick formatting and AI actions',
    },
    {
      icon: FiLayout,
      title: 'Magic Wand',
      description: 'Select text for AI-powered rewrites and transformations',
    },
    {
      icon: FiFilm,
      title: 'Beat Board',
      description: 'Visual story structure with draggable beat cards',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-description"
        className="relative bg-primary-900 rounded-3xl border border-primary-700/30 shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-accent-700/30 via-accent-800/20 to-primary-900 px-8 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
            aria-label="Close welcome dialog"
          >
            <FiX className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent-700/30 rounded-2xl">
              <FiFileText className="w-8 h-8 text-accent-400" aria-hidden="true" />
            </div>
            <div>
              <h2 id="welcome-title" className="text-2xl font-bold text-white">
                Welcome to NarrativeNest
              </h2>
              <p id="welcome-description" className="text-neutral-400">
                AI-powered screenwriting for Nigerian storytellers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Features */}
          <div className="grid gap-4 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-primary-800/50 border border-primary-700/30"
              >
                <div className="p-2 bg-accent-700/20 rounded-lg flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-accent-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{feature.title}</h3>
                  <p className="text-sm text-neutral-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              ref={firstButtonRef}
              onClick={() => {
                onLoadDemo();
                onStartTour();
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-primary-900"
            >
              <FiPlay className="w-5 h-5" aria-hidden="true" />
              Start Interactive Tour
              <span className="text-accent-200 text-sm">(Recommended)</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onLoadDemo();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-800 hover:bg-primary-700 text-neutral-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <FiFileText className="w-4 h-4" aria-hidden="true" />
                Load Demo Document
              </button>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-800 hover:bg-primary-700 text-neutral-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                Skip for Now
                <FiArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-primary-800/30 border-t border-primary-700/30">
          <p className="text-center text-sm text-neutral-500">
            You can restart the tour anytime from Settings
          </p>
        </div>
      </div>
    </div>
  );
}
