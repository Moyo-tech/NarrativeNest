'use client'

import React, { useState, useCallback, useEffect } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../lib/config";
import { Button, Card } from "@/components/ui";
import { consumeStream } from "../../lib/streaming";
import { FiCheck, FiSave } from "react-icons/fi";

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

const MAX = 4;
const MIN = 1;

const GenerateDialogues = () => {
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [generatedDialogue, setGeneratedDialogue] = useState<string>("");
  const [maxScenes, setMaxScenes] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [originalContent, setOriginalContent] = useState<string>('');

  const handleDialogueGeneration = async () => {
    try {
      setLoading(true);
      setIsStreaming(true);
      setGeneratedDialogue("");

      // First, we need to get numScenes from a non-streaming call or include it in streaming
      // For now, we'll use the streaming endpoint and get numScenes separately
      await consumeStream(
        API_ENDPOINTS.generateDialogueStream,
        {},
        {
          onChunk: (chunk) => {
            setGeneratedDialogue((prev) => prev + chunk);
          },
          onComplete: () => {
            setIsStreaming(false);
            setLoading(false);
          },
          onError: (error) => {
            console.error("Streaming error:", error);
            setIsStreaming(false);
            setLoading(false);
          },
        }
      );

      // Get numScenes from non-streaming endpoint (optional metadata call)
      // For now, we'll use the existing value or could be enhanced later
    } catch (error) {
      console.error("Error:", error);
      setIsStreaming(false);
      setLoading(false);
    }
  };

  const handleSceneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSceneValue = Number(event.target.value);
    setCurrentScene(newSceneValue);

    const fetchDialogue = async () => {
      try {
        const response = await axios.post<{ dialogue: string }>(
          API_ENDPOINTS.generateDialogue,
          {
            scene_index: newSceneValue,
          }
        );
        const dialogue = response.data.dialogue;
        setGeneratedDialogue(dialogue);
      } catch (error) {
        console.error("Error fetching dialogue:", error);
      }
    };

    fetchDialogue();
  };

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedDialogue(e.target.value);
  }, []);

  // Track original content when new content is generated
  useEffect(() => {
    if (!isStreaming && generatedDialogue && saveStatus !== 'unsaved' && saveStatus !== 'saving') {
      setOriginalContent(generatedDialogue);
      setSaveStatus('idle');
    }
  }, [isStreaming]);

  // Detect changes and mark as unsaved
  useEffect(() => {
    if (originalContent && generatedDialogue !== originalContent && !isStreaming) {
      setSaveStatus('unsaved');
    }
  }, [generatedDialogue, originalContent, isStreaming]);

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
    if (saveStatus === 'saving' || saveStatus === 'idle') return;

    setSaveStatus('saving');
    try {
      await axios.post(API_ENDPOINTS.saveDialogue, {
        scene_index: currentScene - 1, // API uses 0-based index
        content: generatedDialogue,
      });
      setOriginalContent(generatedDialogue);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('unsaved');
    }
  };

  const showSpinner = loading && !isStreaming && generatedDialogue.length === 0;
  const editable = !isStreaming && !loading;
  const showSaveButton = editable && !isStreaming && generatedDialogue.length > 0;

  return (
    <Card variant="glass" className="mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Dialogues</h3>
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

          {maxScenes > 1 && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-neutral-300 whitespace-nowrap">
                Scene {currentScene} of {maxScenes}
              </label>
              <input
                className="flex-1 sm:w-32 h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer accent-accent-600"
                type="range"
                step="1"
                value={currentScene}
                min={MIN}
                max={maxScenes}
                onChange={handleSceneChange}
                style={{
                  background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${((currentScene - MIN) / (maxScenes - MIN)) * 100}%, rgb(61, 55, 71) ${((currentScene - MIN) / (maxScenes - MIN)) * 100}%, rgb(61, 55, 71) 100%)`
                }}
              />
            </div>
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
            onClick={handleDialogueGeneration}
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      <div className="relative">
        {showSpinner ? (
          <div className="flex flex-col justify-center items-center h-32 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-500"></div>
            <p className="text-accent-300 font-medium">
              Generating dialogues...
            </p>
          </div>
        ) : (
          <>
            <textarea
              rows={6}
              className={`
                w-full p-3 rounded-xl bg-primary-800/50 border
                text-neutral-100 placeholder-neutral-500
                focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent
                resize-none transition-all
                ${isStreaming ? 'border-accent-500/50' : ''}
                ${saveStatus === 'unsaved' ? 'border-amber-500/50' : 'border-primary-700/30'}
                ${editable ? 'cursor-text' : 'cursor-default'}
              `}
              value={generatedDialogue}
              onChange={editable ? handleContentChange : undefined}
              readOnly={!editable}
              placeholder="Generated dialogues will appear here..."
            />
            {isStreaming && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="animate-pulse text-accent-400 text-sm">Streaming</span>
                <span className="inline-block w-2 h-4 bg-accent-400 animate-pulse"></span>
              </div>
            )}
          </>
        )}
      </div>

      {editable && generatedDialogue.length > 0 && (
        <p className="text-xs text-neutral-500 mt-2">
          Click to edit the generated content
        </p>
      )}
    </Card>
  );
};

export default GenerateDialogues;
