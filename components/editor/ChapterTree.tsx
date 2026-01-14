'use client';

import React, { useState } from 'react';
import { ChapterTreeNode } from '@/lib/chapterUtils';
import { Chapter, ChapterType } from '@/types/data';
import { useDocument } from '@/context/DocumentContext';
import {
  FiChevronRight,
  FiChevronDown,
  FiFolder,
  FiFileText,
  FiFilm,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';

interface ChapterTreeItemProps {
  node: ChapterTreeNode;
  depth: number;
  activeChapterId?: string;
}

function ChapterTreeItem({ node, depth, activeChapterId }: ChapterTreeItemProps) {
  const { selectChapter, toggleCollapse, deleteChapter, updateChapter } = useDocument();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.chapter.title);
  const [showMenu, setShowMenu] = useState(false);

  const { chapter, children } = node;
  const isActive = chapter.id === activeChapterId;
  const hasChildren = children.length > 0;
  const isCollapsed = chapter.collapsed;

  const getIcon = (type: ChapterType) => {
    switch (type) {
      case 'act':
        return <FiFolder className="w-4 h-4" />;
      case 'chapter':
        return <FiFileText className="w-4 h-4" />;
      case 'scene':
        return <FiFilm className="w-4 h-4" />;
      default:
        return <FiFileText className="w-4 h-4" />;
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      selectChapter(chapter.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapse(chapter.id);
  };

  const handleEditSubmit = () => {
    if (editTitle.trim()) {
      updateChapter(chapter.id, { title: editTitle.trim() });
    } else {
      setEditTitle(chapter.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(chapter.title);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${chapter.title}"${hasChildren ? ' and all its children' : ''}?`)) {
      deleteChapter(chapter.id);
    }
    setShowMenu(false);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowMenu(false);
  };

  return (
    <div>
      <div
        className={`
          group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer
          transition-colors text-sm
          ${isActive
            ? 'bg-accent-700/30 text-white border border-accent-600/30'
            : 'text-neutral-300 hover:bg-primary-800'
          }
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse toggle */}
        <button
          onClick={handleToggle}
          className={`
            w-5 h-5 flex items-center justify-center rounded
            hover:bg-primary-700/50 transition-colors
            ${!hasChildren && 'invisible'}
          `}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-3 h-3" />
          ) : (
            <FiChevronDown className="w-3 h-3" />
          )}
        </button>

        {/* Icon */}
        <span className={`flex-shrink-0 ${isActive ? 'text-accent-400' : 'text-neutral-400'}`}>
          {getIcon(chapter.type)}
        </span>

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-primary-700 border border-accent-600 rounded px-2 py-0.5 text-sm text-white outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{chapter.title}</span>
        )}

        {/* Type badge */}
        <span className="text-xs text-neutral-500 capitalize flex-shrink-0">
          {chapter.type}
        </span>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`
              w-6 h-6 flex items-center justify-center rounded
              hover:bg-primary-700/50 transition-colors
              ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
          >
            <FiMoreVertical className="w-3 h-3" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-primary-800 border border-primary-700 rounded-lg shadow-lg py-1 min-w-32">
                <button
                  onClick={handleRename}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-300 hover:bg-primary-700"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-primary-700"
                >
                  <FiTrash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {!isCollapsed && hasChildren && (
        <div>
          {children.map((childNode) => (
            <ChapterTreeItem
              key={childNode.chapter.id}
              node={childNode}
              depth={depth + 1}
              activeChapterId={activeChapterId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChapterTreeProps {
  nodes: ChapterTreeNode[];
  activeChapterId?: string;
}

export default function ChapterTree({ nodes, activeChapterId }: ChapterTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-neutral-500 text-sm">
        No chapters yet. Add your first chapter to get started.
      </div>
    );
  }

  return (
    <div className="py-2 space-y-0.5">
      {nodes.map((node) => (
        <ChapterTreeItem
          key={node.chapter.id}
          node={node}
          depth={0}
          activeChapterId={activeChapterId}
        />
      ))}
    </div>
  );
}
