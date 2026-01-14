'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Doc, Chapter, ChapterType } from '@/types/data';
import {
  addChapter,
  updateChapter,
  deleteChapter,
  moveChapter,
  toggleChapterCollapse,
  buildChapterTree,
  getActiveChapter,
  generateDefaultTitle,
  ChapterTreeNode,
} from '@/lib/chapterUtils';

// Action types
type DocumentAction =
  | { type: 'SET_DOC'; payload: Doc }
  | { type: 'ADD_CHAPTER'; payload: { chapterType: ChapterType; title?: string; parentId?: string } }
  | { type: 'UPDATE_CHAPTER'; payload: { chapterId: string; updates: Partial<Chapter> } }
  | { type: 'DELETE_CHAPTER'; payload: { chapterId: string } }
  | { type: 'MOVE_CHAPTER'; payload: { chapterId: string; newParentId?: string; newPosition: number } }
  | { type: 'SELECT_CHAPTER'; payload: { chapterId: string } }
  | { type: 'TOGGLE_COLLAPSE'; payload: { chapterId: string } }
  | { type: 'UPDATE_CHAPTER_CONTENT'; payload: { chapterId: string; content: string } };

// State type
interface DocumentState {
  doc: Doc | null;
  chapterTree: ChapterTreeNode[];
}

// Initial state
const initialState: DocumentState = {
  doc: null,
  chapterTree: [],
};

// Reducer
function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  if (!state.doc && action.type !== 'SET_DOC') {
    return state;
  }

  switch (action.type) {
    case 'SET_DOC': {
      const doc = action.payload;
      return {
        doc,
        chapterTree: buildChapterTree(doc.chapters || []),
      };
    }

    case 'ADD_CHAPTER': {
      const { chapterType, title, parentId } = action.payload;
      const position = state.doc!.chapters.filter((c) => c.parentId === parentId).length;
      const chapterTitle = title || generateDefaultTitle(chapterType, position);
      const newDoc = addChapter(state.doc!, chapterType, chapterTitle, parentId);
      return {
        doc: newDoc,
        chapterTree: buildChapterTree(newDoc.chapters),
      };
    }

    case 'UPDATE_CHAPTER': {
      const { chapterId, updates } = action.payload;
      const newDoc = updateChapter(state.doc!, chapterId, updates);
      return {
        doc: newDoc,
        chapterTree: buildChapterTree(newDoc.chapters),
      };
    }

    case 'DELETE_CHAPTER': {
      const { chapterId } = action.payload;
      const newDoc = deleteChapter(state.doc!, chapterId);
      return {
        doc: newDoc,
        chapterTree: buildChapterTree(newDoc.chapters),
      };
    }

    case 'MOVE_CHAPTER': {
      const { chapterId, newParentId, newPosition } = action.payload;
      const newDoc = moveChapter(state.doc!, chapterId, newParentId, newPosition);
      return {
        doc: newDoc,
        chapterTree: buildChapterTree(newDoc.chapters),
      };
    }

    case 'SELECT_CHAPTER': {
      const { chapterId } = action.payload;
      const newDoc: Doc = {
        ...state.doc!,
        activeChapterId: chapterId,
        updatedAt: Date.now(),
      };
      return {
        ...state,
        doc: newDoc,
      };
    }

    case 'TOGGLE_COLLAPSE': {
      const { chapterId } = action.payload;
      const newDoc = toggleChapterCollapse(state.doc!, chapterId);
      return {
        doc: newDoc,
        chapterTree: buildChapterTree(newDoc.chapters),
      };
    }

    case 'UPDATE_CHAPTER_CONTENT': {
      const { chapterId, content } = action.payload;
      const newDoc = updateChapter(state.doc!, chapterId, { content });
      return {
        doc: newDoc,
        chapterTree: buildChapterTree(newDoc.chapters),
      };
    }

    default:
      return state;
  }
}

// Context types
interface DocumentContextValue {
  doc: Doc | null;
  chapterTree: ChapterTreeNode[];
  activeChapter: Chapter | undefined;
  setDoc: (doc: Doc) => void;
  addChapter: (chapterType: ChapterType, title?: string, parentId?: string) => void;
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (chapterId: string) => void;
  moveChapter: (chapterId: string, newParentId: string | undefined, newPosition: number) => void;
  selectChapter: (chapterId: string) => void;
  toggleCollapse: (chapterId: string) => void;
  updateChapterContent: (chapterId: string, content: string) => void;
}

// Create context
const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

// Provider component
export function DocumentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  const setDoc = useCallback((doc: Doc) => {
    dispatch({ type: 'SET_DOC', payload: doc });
  }, []);

  const addChapterAction = useCallback(
    (chapterType: ChapterType, title?: string, parentId?: string) => {
      dispatch({ type: 'ADD_CHAPTER', payload: { chapterType, title, parentId } });
    },
    []
  );

  const updateChapterAction = useCallback(
    (chapterId: string, updates: Partial<Chapter>) => {
      dispatch({ type: 'UPDATE_CHAPTER', payload: { chapterId, updates } });
    },
    []
  );

  const deleteChapterAction = useCallback((chapterId: string) => {
    dispatch({ type: 'DELETE_CHAPTER', payload: { chapterId } });
  }, []);

  const moveChapterAction = useCallback(
    (chapterId: string, newParentId: string | undefined, newPosition: number) => {
      dispatch({ type: 'MOVE_CHAPTER', payload: { chapterId, newParentId, newPosition } });
    },
    []
  );

  const selectChapter = useCallback((chapterId: string) => {
    dispatch({ type: 'SELECT_CHAPTER', payload: { chapterId } });
  }, []);

  const toggleCollapse = useCallback((chapterId: string) => {
    dispatch({ type: 'TOGGLE_COLLAPSE', payload: { chapterId } });
  }, []);

  const updateChapterContent = useCallback((chapterId: string, content: string) => {
    dispatch({ type: 'UPDATE_CHAPTER_CONTENT', payload: { chapterId, content } });
  }, []);

  const activeChapter = state.doc ? getActiveChapter(state.doc) : undefined;

  const value: DocumentContextValue = {
    doc: state.doc,
    chapterTree: state.chapterTree,
    activeChapter,
    setDoc,
    addChapter: addChapterAction,
    updateChapter: updateChapterAction,
    deleteChapter: deleteChapterAction,
    moveChapter: moveChapterAction,
    selectChapter,
    toggleCollapse,
    updateChapterContent,
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

// Hook to use the context
export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}

// Convenience hooks for specific parts of the context
export function useActiveChapter() {
  const { activeChapter } = useDocument();
  return activeChapter;
}

export function useChapterTree() {
  const { chapterTree } = useDocument();
  return chapterTree;
}
