/**
 * Chapter utility functions for CRUD operations and tree management.
 */
import { nanoid } from 'nanoid';
import { Chapter, ChapterType, Doc } from '@/types/data';

// Default empty Lexical editor state
export const DEFAULT_CHAPTER_CONTENT = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

/**
 * Create a new chapter with default values.
 */
export function createChapter(
  type: ChapterType,
  title: string,
  position: number,
  parentId?: string
): Chapter {
  const now = Date.now();
  return {
    id: nanoid(),
    title,
    type,
    position,
    content: DEFAULT_CHAPTER_CONTENT,
    parentId,
    collapsed: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get the next available position for a chapter at the given level.
 */
export function getNextPosition(chapters: Chapter[], parentId?: string): number {
  const siblings = chapters.filter((c) => c.parentId === parentId);
  if (siblings.length === 0) return 0;
  return Math.max(...siblings.map((c) => c.position)) + 1;
}

/**
 * Add a new chapter to the document.
 */
export function addChapter(
  doc: Doc,
  type: ChapterType,
  title: string,
  parentId?: string
): Doc {
  const position = getNextPosition(doc.chapters, parentId);
  const chapter = createChapter(type, title, position, parentId);
  return {
    ...doc,
    chapters: [...doc.chapters, chapter],
    activeChapterId: chapter.id,
    updatedAt: Date.now(),
  };
}

/**
 * Update an existing chapter.
 */
export function updateChapter(
  doc: Doc,
  chapterId: string,
  updates: Partial<Chapter>
): Doc {
  return {
    ...doc,
    chapters: doc.chapters.map((c) =>
      c.id === chapterId ? { ...c, ...updates, updatedAt: Date.now() } : c
    ),
    updatedAt: Date.now(),
  };
}

/**
 * Delete a chapter and all its children.
 */
export function deleteChapter(doc: Doc, chapterId: string): Doc {
  // Get all descendant IDs
  const getDescendantIds = (id: string): string[] => {
    const children = doc.chapters.filter((c) => c.parentId === id);
    return [id, ...children.flatMap((c) => getDescendantIds(c.id))];
  };

  const idsToDelete = new Set(getDescendantIds(chapterId));
  const remainingChapters = doc.chapters.filter((c) => !idsToDelete.has(c.id));

  // Update active chapter if needed
  let activeChapterId = doc.activeChapterId;
  if (activeChapterId && idsToDelete.has(activeChapterId)) {
    activeChapterId = remainingChapters[0]?.id;
  }

  return {
    ...doc,
    chapters: remainingChapters,
    activeChapterId,
    updatedAt: Date.now(),
  };
}

/**
 * Move a chapter to a new position.
 */
export function moveChapter(
  doc: Doc,
  chapterId: string,
  newParentId: string | undefined,
  newPosition: number
): Doc {
  const chapter = doc.chapters.find((c) => c.id === chapterId);
  if (!chapter) return doc;

  // Get siblings at the new level
  const siblings = doc.chapters.filter(
    (c) => c.parentId === newParentId && c.id !== chapterId
  );

  // Reorder siblings
  const reorderedSiblings = siblings
    .sort((a, b) => a.position - b.position)
    .map((c, index) => {
      const pos = index >= newPosition ? index + 1 : index;
      return c.position !== pos ? { ...c, position: pos, updatedAt: Date.now() } : c;
    });

  // Update the moved chapter
  const movedChapter: Chapter = {
    ...chapter,
    parentId: newParentId,
    position: newPosition,
    updatedAt: Date.now(),
  };

  // Build the updated chapters array
  const otherChapters = doc.chapters.filter(
    (c) => c.parentId !== newParentId && c.id !== chapterId
  );

  return {
    ...doc,
    chapters: [...otherChapters, ...reorderedSiblings, movedChapter],
    updatedAt: Date.now(),
  };
}

/**
 * Toggle a chapter's collapsed state.
 */
export function toggleChapterCollapse(doc: Doc, chapterId: string): Doc {
  return updateChapter(doc, chapterId, {
    collapsed: !doc.chapters.find((c) => c.id === chapterId)?.collapsed,
  });
}

/**
 * Get chapters organized as a tree structure.
 */
export interface ChapterTreeNode {
  chapter: Chapter;
  children: ChapterTreeNode[];
}

export function buildChapterTree(chapters: Chapter[]): ChapterTreeNode[] {
  const rootChapters = chapters
    .filter((c) => !c.parentId)
    .sort((a, b) => a.position - b.position);

  const buildNode = (chapter: Chapter): ChapterTreeNode => {
    const children = chapters
      .filter((c) => c.parentId === chapter.id)
      .sort((a, b) => a.position - b.position)
      .map(buildNode);

    return { chapter, children };
  };

  return rootChapters.map(buildNode);
}

/**
 * Get the active chapter from a document.
 */
export function getActiveChapter(doc: Doc): Chapter | undefined {
  if (!doc.activeChapterId) return undefined;
  return doc.chapters.find((c) => c.id === doc.activeChapterId);
}

/**
 * Get the parent chain for a chapter (for breadcrumb navigation).
 */
export function getChapterBreadcrumb(doc: Doc, chapterId: string): Chapter[] {
  const result: Chapter[] = [];
  let current = doc.chapters.find((c) => c.id === chapterId);

  while (current) {
    result.unshift(current);
    current = current.parentId
      ? doc.chapters.find((c) => c.id === current!.parentId)
      : undefined;
  }

  return result;
}

/**
 * Generate a default title based on chapter type and position.
 */
export function generateDefaultTitle(type: ChapterType, position: number): string {
  switch (type) {
    case 'act':
      return `Act ${position + 1}`;
    case 'chapter':
      return `Chapter ${position + 1}`;
    case 'scene':
      return `Scene ${position + 1}`;
    default:
      return `Untitled ${position + 1}`;
  }
}

/**
 * Get the icon name for a chapter type.
 */
export function getChapterTypeIcon(type: ChapterType): string {
  switch (type) {
    case 'act':
      return 'folder';
    case 'chapter':
      return 'file-text';
    case 'scene':
      return 'film';
    default:
      return 'file';
  }
}

/**
 * Migrate a legacy doc (without chapters) to the new structure.
 */
export function migrateDocToChapters(doc: Doc): Doc {
  // If doc already has chapters, return as is
  if (doc.chapters && doc.chapters.length > 0) {
    return doc;
  }

  // Create a default chapter with the existing content
  const defaultChapter = createChapter('chapter', 'Main Content', 0);
  defaultChapter.content = doc.data;

  return {
    ...doc,
    chapters: [defaultChapter],
    activeChapterId: defaultChapter.id,
  };
}
