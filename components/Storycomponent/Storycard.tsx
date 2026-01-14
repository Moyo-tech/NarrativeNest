'use client'

import React, { useState, useEffect, useRef } from "react";
import { Button, Card } from "@/components/ui";
import { FiCheck, FiSave } from "react-icons/fi";

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

interface StorycardProps {
  title: string;
  generatedResult: string;
  onRun: () => void;
  loadingtext: string;
  loading: boolean;
  isStreaming?: boolean;
  onContentChange?: (content: string) => void;
  editable?: boolean;
  onSave?: (content: string) => Promise<void>;
}

const Storycard: React.FC<StorycardProps> = ({
  title,
  generatedResult,
  loading,
  loadingtext,
  onRun,
  isStreaming = false,
  onContentChange,
  editable = false,
  onSave,
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [originalContent, setOriginalContent] = useState<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track original content when new content is generated
  useEffect(() => {
    if (!isStreaming && generatedResult && saveStatus !== 'unsaved' && saveStatus !== 'saving') {
      setOriginalContent(generatedResult);
      setSaveStatus('idle');
    }
  }, [isStreaming]);

  // Detect changes and mark as unsaved
  useEffect(() => {
    if (originalContent && generatedResult !== originalContent && !isStreaming) {
      setSaveStatus('unsaved');
    }
  }, [generatedResult, originalContent, isStreaming]);

  // Clear "saved" status after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timeout = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [saveStatus]);

  const handleSave = async () => {
    if (!onSave || saveStatus === 'saving' || saveStatus === 'idle') return;

    setSaveStatus('saving');
    try {
      await onSave(generatedResult);
      setOriginalContent(generatedResult);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('unsaved');
    }
  };

  const showSpinner = loading && !isStreaming && generatedResult.length === 0;
  const showSaveButton = onSave && editable && !isStreaming && generatedResult.length > 0;

  return (
    <Card variant="glass" className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {/* Save status indicator */}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <FiCheck className="w-3 h-3" />
              Saved
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-xs text-amber-400">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSaveButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === 'idle' || saveStatus === 'saving'}
              className={`
                ${saveStatus === 'unsaved' ? 'text-amber-400 hover:text-amber-300' : 'text-neutral-400'}
              `}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-current mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onRun}
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {showSpinner ? (
        <div className="flex flex-col justify-center items-center h-32 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-500"></div>
          <p className="text-accent-300 font-medium">
            {loadingtext}
          </p>
        </div>
      ) : (
        <div className="relative">
          <textarea
            rows={4}
            className={`
              w-full p-3 rounded-xl bg-primary-800/50 border
              text-neutral-100 placeholder-neutral-500
              focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent
              resize-none transition-all
              ${isStreaming ? 'border-accent-500/50' : ''}
              ${saveStatus === 'unsaved' ? 'border-amber-500/50' : 'border-primary-700/30'}
              ${editable ? 'cursor-text' : 'cursor-default'}
            `}
            value={generatedResult}
            onChange={(e) => {
              if (editable && onContentChange) {
                onContentChange(e.target.value);
              }
            }}
            readOnly={!editable}
            placeholder={isStreaming ? "" : "Generated content will appear here..."}
          />
          {isStreaming && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="animate-pulse text-accent-400 text-sm">Streaming</span>
              <span className="inline-block w-2 h-4 bg-accent-400 animate-pulse"></span>
            </div>
          )}
        </div>
      )}

      {editable && !isStreaming && generatedResult.length > 0 && saveStatus === 'idle' && (
        <p className="text-xs text-neutral-500 mt-2">
          Click to edit the generated content
        </p>
      )}
    </Card>
  );
};

export default Storycard;
