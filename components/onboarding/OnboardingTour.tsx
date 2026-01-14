'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useOnboarding } from '@/context/OnboardingContext';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '.editor-contenteditable',
    title: 'Your Writing Space',
    content: 'This is your main editor. Write, edit, and format your screenplay here. The editor supports rich text formatting and screenplay-specific styles.',
    placement: 'right',
  },
  {
    target: '.toolbar-container',
    title: 'Formatting Toolbar',
    content: 'Use the toolbar for text formatting, headings, lists, and more. Or try slash commands for faster access!',
    placement: 'bottom',
  },
  {
    target: '.editor-contenteditable',
    title: 'Slash Commands',
    content: 'Type "/" anywhere in the editor to open the command menu. Access formatting, AI actions, and Nigerian dialect transformations quickly.',
    placement: 'right',
  },
  {
    target: '.editor-contenteditable',
    title: 'Magic Wand',
    content: 'Select any text to reveal the Magic Wand. Use it for AI-powered rewrites, dialogue tone changes, and more - with inline suggestions!',
    placement: 'right',
  },
  {
    target: '[data-tour="beat-board"]',
    title: 'Beat Board',
    content: 'Click the tabs above to access Beat Board mode. Generate plot structures, brainstorm ideas, and create character profiles - then drag them into your editor.',
    placement: 'left',
    spotlightPadding: 8,
  },
  {
    target: '[data-tour="story-generator"]',
    title: 'Story Generator',
    content: 'Use the Story Generator to create complete story outlines from a simple logline. It generates titles, characters, scenes, and dialogues hierarchically.',
    placement: 'top',
  },
  {
    target: '[data-tour="documents"]',
    title: 'Document Management',
    content: 'Organize your work with documents and chapters. Click a document to expand and see its chapters, or create new ones.',
    placement: 'right',
  },
  {
    target: '[data-tour="settings"]',
    title: 'Settings & Plugins',
    content: 'Configure your API key, model preferences, and create custom plugins. Your custom plugins appear in the slash command menu!',
    placement: 'bottom',
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

function calculatePosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: TourStep['placement']
): TooltipPosition {
  const ARROW_OFFSET = 12;
  const PADDING = 16;

  let top = 0;
  let left = 0;
  let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  switch (placement) {
    case 'top':
      top = targetRect.top - tooltipHeight - ARROW_OFFSET;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      arrowPosition = 'bottom';
      break;
    case 'bottom':
      top = targetRect.bottom + ARROW_OFFSET;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      arrowPosition = 'top';
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - ARROW_OFFSET;
      arrowPosition = 'right';
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + ARROW_OFFSET;
      arrowPosition = 'left';
      break;
  }

  // Keep tooltip within viewport
  const maxLeft = window.innerWidth - tooltipWidth - PADDING;
  const maxTop = window.innerHeight - tooltipHeight - PADDING;
  left = Math.max(PADDING, Math.min(left, maxLeft));
  top = Math.max(PADDING, Math.min(top, maxTop));

  return { top, left, arrowPosition };
}

export default function OnboardingTour() {
  const { state, stopTour, setTourCompleted, setStep, nextStep, prevStep } = useOnboarding();
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const currentStep = TOUR_STEPS[state.currentStep];
  const isLastStep = state.currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = state.currentStep === 0;

  // Find and highlight target element
  const updateTarget = useCallback(() => {
    if (!currentStep) return;

    const target = document.querySelector(currentStep.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll target into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // If target not found, try again after a short delay
      setTimeout(updateTarget, 500);
    }
  }, [currentStep]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.isTourActive && currentStep) {
      updateTarget();

      // Update on resize/scroll
      window.addEventListener('resize', updateTarget);
      window.addEventListener('scroll', updateTarget);

      return () => {
        window.removeEventListener('resize', updateTarget);
        window.removeEventListener('scroll', updateTarget);
      };
    }
  }, [state.isTourActive, state.currentStep, updateTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          stopTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (isLastStep) {
            setTourCompleted();
          } else {
            nextStep();
          }
          break;
        case 'ArrowLeft':
          if (!isFirstStep) {
            prevStep();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isTourActive, isLastStep, isFirstStep, stopTour, setTourCompleted, nextStep, prevStep]);

  if (!mounted || !state.isTourActive || !currentStep) {
    return null;
  }

  const tooltipWidth = 340;
  const tooltipHeight = 200;
  const position = targetRect
    ? calculatePosition(targetRect, tooltipWidth, tooltipHeight, currentStep.placement)
    : { top: 100, left: 100, arrowPosition: 'top' as const };

  const spotlightPadding = currentStep.spotlightPadding || 4;

  return createPortal(
    <div className="fixed inset-0 z-[60] pointer-events-none" aria-hidden="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={stopTour} />

      {/* Spotlight cutout */}
      {targetRect && (
        <div
          className="absolute bg-transparent rounded-lg pointer-events-none"
          style={{
            top: targetRect.top - spotlightPadding,
            left: targetRect.left - spotlightPadding,
            width: targetRect.width + spotlightPadding * 2,
            height: targetRect.height + spotlightPadding * 2,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={setTooltipRef}
        className="absolute pointer-events-auto"
        style={{
          top: position.top,
          left: position.left,
          width: tooltipWidth,
        }}
      >
        <div
          role="dialog"
          aria-modal="false"
          aria-label={`Tour step ${state.currentStep + 1} of ${TOUR_STEPS.length}: ${currentStep.title}`}
          className="relative bg-primary-900 rounded-2xl border border-primary-700/50 shadow-2xl overflow-hidden"
        >
          {/* Arrow */}
          <div
            className={`
              absolute w-3 h-3 bg-primary-900 border-primary-700/50 transform rotate-45
              ${position.arrowPosition === 'top' ? 'top-[-7px] left-1/2 -translate-x-1/2 border-l border-t' : ''}
              ${position.arrowPosition === 'bottom' ? 'bottom-[-7px] left-1/2 -translate-x-1/2 border-r border-b' : ''}
              ${position.arrowPosition === 'left' ? 'left-[-7px] top-1/2 -translate-y-1/2 border-l border-b' : ''}
              ${position.arrowPosition === 'right' ? 'right-[-7px] top-1/2 -translate-y-1/2 border-r border-t' : ''}
            `}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-accent-700/20 border-b border-primary-700/30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-accent-600/30 text-accent-300 rounded-full">
                {state.currentStep + 1} / {TOUR_STEPS.length}
              </span>
              <h3 className="font-medium text-white">{currentStep.title}</h3>
            </div>
            <button
              onClick={stopTour}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label="Close tour"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <p className="text-sm text-neutral-300 leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-800/30 border-t border-primary-700/30">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent-500
                ${isFirstStep
                  ? 'text-neutral-600 cursor-not-allowed'
                  : 'text-neutral-400 hover:text-white hover:bg-primary-700'
                }
              `}
              aria-label="Previous step"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5" role="tablist" aria-label="Tour steps">
              {TOUR_STEPS.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={index === state.currentStep}
                  aria-label={`Go to step ${index + 1}`}
                  onClick={() => setStep(index)}
                  className={`
                    w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500
                    ${index === state.currentStep
                      ? 'bg-accent-500'
                      : index < state.currentStep
                        ? 'bg-accent-700'
                        : 'bg-primary-700'
                    }
                  `}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                onClick={setTourCompleted}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm bg-accent-600 hover:bg-accent-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Finish tour"
              >
                <FiCheck className="w-4 h-4" />
                Finish
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-accent-400 hover:text-white hover:bg-accent-700/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Next step"
              >
                Next
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
