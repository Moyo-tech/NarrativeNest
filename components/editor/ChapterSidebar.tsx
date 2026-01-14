'use client';

import React, { useState } from 'react';
import { useDocument } from '@/context/DocumentContext';
import ChapterTree from './ChapterTree';
import { ChapterType } from '@/types/data';
import {
  FiPlus,
  FiFolder,
  FiFileText,
  FiFilm,
  FiChevronDown,
  FiX,
} from 'react-icons/fi';

interface AddChapterMenuProps {
  parentId?: string;
  onClose: () => void;
}

function AddChapterMenu({ parentId, onClose }: AddChapterMenuProps) {
  const { addChapter } = useDocument();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ChapterType>('chapter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addChapter(type, title || undefined, parentId);
    onClose();
  };

  const typeOptions: { value: ChapterType; label: string; icon: React.ReactNode }[] = [
    { value: 'act', label: 'Act', icon: <FiFolder className="w-4 h-4" /> },
    { value: 'chapter', label: 'Chapter', icon: <FiFileText className="w-4 h-4" /> },
    { value: 'scene', label: 'Scene', icon: <FiFilm className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 border-t border-primary-700/30">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">New Chapter</h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-primary-700 text-neutral-400 hover:text-white transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Type selector */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Type</label>
            <div className="flex gap-1">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    transition-colors border
                    ${type === option.value
                      ? 'bg-accent-700/30 border-accent-600/50 text-white'
                      : 'bg-primary-800 border-primary-700/30 text-neutral-400 hover:text-white'
                    }
                  `}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`New ${type}`}
              className="w-full px-3 py-2 rounded-lg bg-primary-800 border border-primary-700/30 text-white placeholder-neutral-500 text-sm outline-none focus:border-accent-600/50 transition-colors"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium transition-colors"
          >
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ChapterSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function ChapterSidebar({ isOpen, onClose }: ChapterSidebarProps) {
  const { doc, chapterTree, activeChapter } = useDocument();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addParentId, setAddParentId] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handleAddChapter = (parentId?: string) => {
    setAddParentId(parentId);
    setShowAddMenu(true);
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-primary-700/30 flex flex-col h-full bg-primary-900/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary-700/30">
        <h3 className="text-sm font-semibold text-white">Chapters</h3>
        <button
          onClick={() => handleAddChapter()}
          className="p-1.5 rounded-lg bg-accent-600 hover:bg-accent-500 text-white transition-colors"
          title="Add chapter"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Chapter tree */}
      <div className="flex-1 overflow-y-auto">
        {doc ? (
          <ChapterTree
            nodes={chapterTree}
            activeChapterId={doc.activeChapterId}
          />
        ) : (
          <div className="px-4 py-8 text-center text-neutral-500 text-sm">
            No document selected
          </div>
        )}
      </div>

      {/* Quick add buttons for active chapter */}
      {activeChapter && activeChapter.type === 'act' && (
        <div className="px-4 py-2 border-t border-primary-700/30">
          <button
            onClick={() => handleAddChapter(activeChapter.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors"
          >
            <FiPlus className="w-3 h-3" />
            Add scene to {activeChapter.title}
          </button>
        </div>
      )}

      {/* Add chapter menu */}
      {showAddMenu && (
        <AddChapterMenu
          parentId={addParentId}
          onClose={() => {
            setShowAddMenu(false);
            setAddParentId(undefined);
          }}
        />
      )}

      {/* Stats footer */}
      {doc && doc.chapters && doc.chapters.length > 0 && (
        <div className="px-4 py-2 border-t border-primary-700/30 text-xs text-neutral-500">
          {doc.chapters.length} {doc.chapters.length === 1 ? 'chapter' : 'chapters'}
        </div>
      )}
    </div>
  );
}
