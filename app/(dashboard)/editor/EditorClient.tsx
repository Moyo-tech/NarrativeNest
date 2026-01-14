'use client'

import ExampleTheme from "@/components/plugins/Theme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "@/components/plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import ActionsPlugin from "@/components/plugins/ActionsPlugin";
import CodeHighlightPlugin from "@/components/plugins/CodeHighlightPlugin";
import prepopulatedText from "@/components/plugins/SampleText";
import CopilotPlugin from "@/components/plugins/CopilotPlugin";
import BeatBoardPanelWrapper from "@/components/plugins/BeatBoardPlugin";
import DraggableBlockPlugin from "@/components/plugins/DraggableBlockPlugin";
import { useEffect, useRef, useState } from "react";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {
  Role,
  ChatHistory,
  Message,
  Doc,
  DefaultSetting,
  Setting,
  Action,
  DefaultActions,
  TaskType,
} from "@/types/data";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState, LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import RestorePlugin from "@/components/plugins/RestorePlugin";
import {
  FiBook,
  FiDownload,
  FiMenu,
  FiMessageSquare,
  FiSettings,
  FiUpload,
  FiX,
  FiFileText,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiAlignCenter,
  FiFolder,
  FiFilm,
  FiTrash2,
} from "react-icons/fi";

import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { TitleProvider } from "@/context/TitleContext";
import { AppBarProvider } from "@/context/AppBarContext";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Prompts from "@/components/prompts";
import Settings from "@/components/settings";
import Modal from "@/components/modal";
import { nanoid } from "nanoid";
import Storycomponent from "@/components/Storycomponent";
import { useAppBarContext } from "@/context/AppBarContext";
import SiderbarLeft from "@/components/SiderbarLeft";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Button, Card } from "@/components/ui";
import { useDistractionFree } from "@/context/DistractionFreeContext";
import { DocumentProvider, useDocument } from "@/context/DocumentContext";
import { PluginProvider, usePlugins } from "@/context/PluginContext";
import { migrateDocToChapters, createChapter, ChapterTreeNode, buildChapterTree } from "@/lib/chapterUtils";
import { Chapter, ChapterType } from "@/types/data";
import type { UserPlugin } from "@/types/plugin";
import GenerateTitle from "@/components/Storycomponent/GenerateTitle";
import CharacterComp from "@/components/Storycomponent/CharacterComp";
import GeneratePlot from "@/components/Storycomponent/GeneratePlot";
import GeneratePlace from "@/components/Storycomponent/GeneratePlace";
import GenerateDialogues from "@/components/Storycomponent/GenerateDialogues";
import RenderStory from "@/components/Storycomponent/RenderStory";
import TypewriterModePlugin from "@/components/plugins/TypewriterModePlugin";
import SlashCommandPlugin from "@/components/plugins/SlashCommandPlugin";
import MagicWandPlugin from "@/components/plugins/MagicWandPlugin";
import BeatBoardDropZonePlugin from "@/components/plugins/BeatBoardPlugin/BeatBoardDropZonePlugin";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { WelcomeModal, OnboardingTour } from "@/components/onboarding";
import { DEMO_DOCUMENT_TITLE, createDemoEditorState, DEMO_CHAPTERS } from "@/lib/demoDocument";

// Component to sync EditorClient's currentDoc with DocumentContext
function DocumentSync({ currentDoc }: { currentDoc: Doc | null }) {
  const { setDoc } = useDocument();

  useEffect(() => {
    if (currentDoc) {
      setDoc(currentDoc);
    }
  }, [currentDoc, setDoc]);

  return null;
}

export function getSavedSettings(): Setting {
  let prevSettings: Setting = DefaultSetting;
  let _setting = localStorage.getItem("settings");
  if (_setting) {
    prevSettings = JSON.parse(_setting) as Setting;
    if (prevSettings.actionPrompts === undefined) {
      prevSettings.actionPrompts = DefaultActions;
    }
  }
  console.log("GET SETTING", prevSettings);
  return prevSettings;
}

function Placeholder() {
  return <div className="editor-placeholder">Type something...</div>;
}

interface DocIndex {
  id: string;
  title: string;
}

function Editor({
  editorState,
  onCreateChat,
  onChange,
  history,
  setting,
  onTitleChange,
  isDistractionFree = false,
  isTypewriterMode = false,
  chapters = [],
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  userPlugins = [],
}: {
  editorState: string;
  onCreateChat: (task: string, content: string) => void;
  onChange: (editorState: EditorState) => void;
  history: ChatHistory[];
  setting: Setting;
  onTitleChange: (title: string) => void;
  isDistractionFree?: boolean;
  isTypewriterMode?: boolean;
  chapters?: Chapter[];
  activeChapterId?: string;
  onSelectChapter?: (chapterId: string) => void;
  onAddChapter?: (type: ChapterType) => void;
  userPlugins?: UserPlugin[];
}) {
  const [isPromptsOpen, setIsPromptsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  // Icon for chapter type
  const getChapterIcon = (type: ChapterType) => {
    switch (type) {
      case 'act':
        return <FiFolder className="w-3 h-3" />;
      case 'scene':
        return <FiFilm className="w-3 h-3" />;
      default:
        return <FiFileText className="w-3 h-3" />;
    }
  };

  const editorConfig = {
    namespace: "Editor",
    theme: ExampleTheme,
    editorState: editorState,
    onError(error: any) {
      throw error;
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
  };

  function onRef(editorNode: HTMLElement | null) {}

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <LexicalComposer initialConfig={editorConfig}>
        {isDistractionFree ? (
          // Distraction-free mode: Editor only, no panels
          <div className="flex flex-col h-full">
            <div className="editor-container flex flex-col h-full">
              <ToolbarPlugin setIsPromptsOpen={setIsPromptsOpen} />
              <div className="flex items-center gap-3 px-4 border-b border-primary-700/30 py-4 mb-4">
                <input
                  className="flex-1 text-4xl outline-none bg-transparent text-white placeholder-neutral-500"
                  placeholder="Untitled"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    onTitleChange(e.target.value);
                  }}
                />
                {/* Chapter dropdown */}
                {chapters.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-800 hover:bg-primary-700 text-sm text-neutral-300 transition-colors"
                    >
                      {activeChapter ? (
                        <>
                          {getChapterIcon(activeChapter.type)}
                          <span className="max-w-32 truncate">{activeChapter.title}</span>
                        </>
                      ) : (
                        <span>Select Chapter</span>
                      )}
                      <FiChevronDown className="w-3 h-3" />
                    </button>

                    {showChapterDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowChapterDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 z-20 bg-primary-800 border border-primary-700 rounded-xl shadow-xl py-2 min-w-48 max-h-64 overflow-y-auto">
                          {chapters.map((chapter) => (
                            <button
                              key={chapter.id}
                              onClick={() => {
                                onSelectChapter?.(chapter.id);
                                setShowChapterDropdown(false);
                              }}
                              className={`
                                w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                                ${chapter.id === activeChapterId
                                  ? 'bg-accent-700/30 text-white'
                                  : 'text-neutral-300 hover:bg-primary-700'
                                }
                              `}
                            >
                              {getChapterIcon(chapter.type)}
                              <span className="flex-1 text-left truncate">{chapter.title}</span>
                              <span className="text-xs text-neutral-500 capitalize">{chapter.type}</span>
                            </button>
                          ))}
                          <div className="border-t border-primary-700 mt-2 pt-2">
                            <button
                              onClick={() => {
                                onAddChapter?.('chapter');
                                setShowChapterDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-primary-700 transition-colors"
                            >
                              <FiPlus className="w-3 h-3" />
                              Add Chapter
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="relative flex-1 overflow-y-auto px-4">
                <RichTextPlugin
                  contentEditable={
                    <div className="editor-scroller h-full">
                      <div className="editor" ref={onRef}>
                        <ContentEditable className="editor-contenteditable min-h-full max-w-4xl mx-auto" />
                      </div>
                    </div>
                  }
                  placeholder={<Placeholder />}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <AutoFocusPlugin />
                <ListPlugin />
                <LinkPlugin />
                <HistoryPlugin />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <CodeHighlightPlugin />
                <OnChangePlugin
                  onChange={onChange}
                  ignoreSelectionChange={true}
                />
                <TypewriterModePlugin enabled={isTypewriterMode} />
                <SlashCommandPlugin
                  setting={setting}
                  onCreateChat={onCreateChat}
                  userPlugins={userPlugins}
                />
                <MagicWandPlugin setting={setting} />
                <BeatBoardDropZonePlugin />
              </div>
              <ActionsPlugin />
            </div>
          </div>
        ) : (
          // Normal mode: Editor with Copilot panel
          <PanelGroup direction="horizontal" className="h-full">
            {/* Editor Panel */}
            <Panel defaultSize={60} minSize={30} className="flex flex-col h-full">
              <div className="editor-container flex flex-col h-full">
                <ToolbarPlugin setIsPromptsOpen={setIsPromptsOpen} />
                <div className="flex items-center gap-3 px-4 border-b border-primary-700/30 py-4 mb-4">
                  <input
                    className="flex-1 text-4xl outline-none bg-transparent text-white placeholder-neutral-500"
                    placeholder="Untitled"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      onTitleChange(e.target.value);
                    }}
                  />
                  {/* Chapter dropdown */}
                  {chapters.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-800 hover:bg-primary-700 text-sm text-neutral-300 transition-colors"
                      >
                        {activeChapter ? (
                          <>
                            {getChapterIcon(activeChapter.type)}
                            <span className="max-w-32 truncate">{activeChapter.title}</span>
                          </>
                        ) : (
                          <span>Select Chapter</span>
                        )}
                        <FiChevronDown className="w-3 h-3" />
                      </button>

                      {showChapterDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowChapterDropdown(false)}
                          />
                          <div className="absolute right-0 top-full mt-2 z-20 bg-primary-800 border border-primary-700 rounded-xl shadow-xl py-2 min-w-48 max-h-64 overflow-y-auto">
                            {chapters.map((chapter) => (
                              <button
                                key={chapter.id}
                                onClick={() => {
                                  onSelectChapter?.(chapter.id);
                                  setShowChapterDropdown(false);
                                }}
                                className={`
                                  w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                                  ${chapter.id === activeChapterId
                                    ? 'bg-accent-700/30 text-white'
                                    : 'text-neutral-300 hover:bg-primary-700'
                                  }
                                `}
                              >
                                {getChapterIcon(chapter.type)}
                                <span className="flex-1 text-left truncate">{chapter.title}</span>
                                <span className="text-xs text-neutral-500 capitalize">{chapter.type}</span>
                              </button>
                            ))}
                            <div className="border-t border-primary-700 mt-2 pt-2">
                              <button
                                onClick={() => {
                                  onAddChapter?.('chapter');
                                  setShowChapterDropdown(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-primary-700 transition-colors"
                              >
                                <FiPlus className="w-3 h-3" />
                                Add Chapter
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative flex-1 overflow-y-auto px-4">
                  <RichTextPlugin
                    contentEditable={
                      <div className="editor-scroller h-full">
                        <div className="editor" ref={onRef}>
                          <ContentEditable className="editor-contenteditable min-h-full" />
                        </div>
                      </div>
                    }
                    placeholder={<Placeholder />}
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <AutoFocusPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <HistoryPlugin />
                  <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                  <CodeHighlightPlugin />
                  <OnChangePlugin
                    onChange={onChange}
                    ignoreSelectionChange={true}
                  />
                  <TypewriterModePlugin enabled={isTypewriterMode} />
                  <SlashCommandPlugin
                    setting={setting}
                    onCreateChat={onCreateChat}
                    userPlugins={userPlugins}
                  />
                  <MagicWandPlugin setting={setting} />
                  <BeatBoardDropZonePlugin />
                </div>
                <ActionsPlugin />
              </div>
            </Panel>

            {/* Copilot Panel */}
            <PanelResizeHandle className="w-1 bg-primary-700/30 hover:bg-accent-600 transition-colors" />
            <Panel
              defaultSize={40}
              minSize={20}
              className="h-full overflow-hidden"
            >
              <div className="h-full overflow-hidden">
                <BeatBoardPanelWrapper
                  setting={setting}
                  history={history}
                  onChatUpdate={() => {}}
                />
              </div>
            </Panel>
          </PanelGroup>
        )}
      </LexicalComposer>
    </div>
  );
}

export default function EditorClient() {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const defaultData: string =
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';
  const [editorState, setEditorState] = useState<string>(defaultData);
  const [docs, setDocs] = useState<DocIndex[]>([]);

  let [isSettingsOpen, setIsSettingsOpen] = useState(false);
  let [isPromptsOpen, setIsPromptsOpen] = useState(false);
  let [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  let [isStoryGenOpen, setIsStoryGenOpen] = useState(false);
  let [isTypewriterMode, setIsTypewriterMode] = useState(false);

  // Document expansion state for chapter navigation
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  // User plugins state
  const [userPlugins, setUserPlugins] = useState<UserPlugin[]>([]);

  // Onboarding state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  const { isDistractionFree, setIsDistractionFree } = useDistractionFree();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const [docPrompt, setDocPrompt] = useState<string>("");
  const [setting, setSetting] = useState<Setting>(DefaultSetting);
  const [currentDoc, setCurrentDoc] = useState<Doc | null>(null);

  useEffect(() => {
    if (currentDoc === null) {
      const docId = localStorage.getItem("selectedDocId");
      if (docId === undefined || docId === null) {
        onCreateDoc();
        console.log("Creating new doc");
      } else {
        onSelectDoc(docId);
        console.log("Loading doc", docId, currentDoc);
      }

      const _docs = localStorage.getItem("docs");
      if (_docs) {
        setDocs(JSON.parse(_docs));
      }
    }
  }, []);

  // Load user plugins from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('narrativenest-user-plugins');
      if (stored) {
        const plugins = JSON.parse(stored) as UserPlugin[];
        setUserPlugins(plugins.filter((p) => p.enabled));
      }
    } catch (error) {
      console.error('Failed to load user plugins:', error);
    }

    // Listen for storage changes (in case plugins are updated in settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'narrativenest-user-plugins') {
        try {
          const plugins = e.newValue ? JSON.parse(e.newValue) as UserPlugin[] : [];
          setUserPlugins(plugins.filter((p) => p.enabled));
        } catch (error) {
          console.error('Failed to parse plugins from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for first-time user and show welcome modal
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('narrativenest-onboarding');
    if (!hasSeenWelcome) {
      // Delay showing welcome modal to let the UI settle
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Function to load demo document
  const loadDemoDocument = () => {
    const demoEditorState = createDemoEditorState();

    // Create chapters from demo content
    const demoChapters = DEMO_CHAPTERS.map((chapter, index) => ({
      id: `demo-chapter-${index}`,
      title: chapter.title,
      type: chapter.type,
      position: index,
      content: JSON.stringify({
        root: {
          children: [
            {
              children: [
                { detail: 0, format: 0, mode: 'normal', style: '', text: chapter.content, type: 'text', version: 1 }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        }
      }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const demoDoc: Doc = {
      id: 'demo-' + nanoid(),
      title: DEMO_DOCUMENT_TITLE,
      prompt: "A Nigerian investigative journalist uncovers a massive oil scandal in Lagos.",
      data: demoEditorState,
      history: [],
      chapters: demoChapters,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const _docs: DocIndex[] = [
      { id: "doc-" + demoDoc.id, title: demoDoc.title } as DocIndex,
      ...docs,
    ];
    setDocs(_docs);
    localStorage.setItem("docs", JSON.stringify(_docs));
    localStorage.setItem("doc-" + demoDoc.id, JSON.stringify(demoDoc));
    localStorage.setItem("selectedDocId", "doc-" + demoDoc.id);
    setCurrentDoc(demoDoc);
    setEditorState(demoDoc.data);
    setHistory(demoDoc.history);

    // Mark onboarding as seen
    localStorage.setItem('narrativenest-onboarding', JSON.stringify({ hasSeenWelcome: true }));
  };

  // Handle welcome modal actions
  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('narrativenest-onboarding', JSON.stringify({ hasSeenWelcome: true }));
  };

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    setIsTourActive(true);
    localStorage.setItem('narrativenest-onboarding', JSON.stringify({ hasSeenWelcome: true }));
  };

  const onChatUpdate = (id: string, role: Role, response: string) => {
    let _history: ChatHistory[] = [];
    for (let i = 0; i < history.length; i++) {
      const chat = history[i];
      if (chat.id == id) {
        let c: ChatHistory = { ...chat };
        console.log("OLD CHAT:", chat);
        c.messages.push({ role: role, content: response } as Message);
        console.log("NEW CHAT:", c);
        _history.push(c);
      } else {
        _history.push(chat);
      }
    }
    setHistory(_history);
    saveDoc(editorState, _history);
    console.log("Saving history..", _history);
  };

  async function onCreateChat(task: string, content: string) {
    let actionPrompt: Action | undefined;
    for (let i = 0; i < setting.actionPrompts.length; i++) {
      const ap: Action = setting.actionPrompts[i];
      if (ap.id == task) {
        actionPrompt = ap;
        break;
      }
    }
    if (!actionPrompt || !currentDoc) return;

    const messages: Message[] = [
      {
        role: "system" as Role,
        content: setting.globalPrompt + currentDoc.prompt + actionPrompt.prompt,
      },
      {
        role: "user" as Role,
        content: content,
      },
    ];

    let chat: ChatHistory = {
      id: nanoid(),
      task: task as TaskType,
      tone: "professional",
      selection: content,
      messages: messages,
      modelId: setting.modelId,
      temperature: setting.temperature,
    };
    console.log("NEW", task, content, chat);
    const _history = [chat, ...history];
    setHistory(_history);
    saveDoc(editorState, _history);
    console.log("onCreateChat saving", _history);
  }

  const onChange = (editorState: EditorState) => {
    if (currentDoc) {
      const _editorState = JSON.stringify(editorState.toJSON());
      setEditorState(_editorState);
      saveDoc(_editorState, history);
      console.log("Saving changes...", history);
    }
  };

  const onCreateDoc = () => {
    const doc: Doc = {
      id: nanoid(),
      title: "Untitled",
      prompt: "",
      data: defaultData,
      history: [],
      chapters: [], // Initialize empty chapters array
      createdAt: +new Date(),
      updatedAt: +new Date(),
    };
    const _docs: DocIndex[] = [
      { id: "doc-" + doc.id, title: doc.title } as DocIndex,
      ...docs,
    ];
    setDocs(_docs);
    localStorage.setItem("docs", JSON.stringify(_docs));
    localStorage.setItem("doc-" + doc.id, JSON.stringify(doc));
    localStorage.setItem("selectedDocId", "doc-" + doc.id);
    setCurrentDoc(doc);
    setEditorState(doc.data);
    setHistory(doc.history);
    console.log("created", doc.id);
  };

  const onSelectDoc = (docId: string, targetChapterId?: string) => {
    const prevSettings: Setting = getSavedSettings();
    setSetting(prevSettings);
    console.log("selectedDoc", docId, "targetChapter", targetChapterId);
    const docData = localStorage.getItem(docId);
    if (!docData) return;
    let doc = JSON.parse(docData) as Doc;
    // Migrate legacy docs without chapters array
    if (!doc.chapters) {
      doc = { ...doc, chapters: [] };
    }

    // Determine which editor state to load
    let editorContent = doc.data;
    let activeChapterId = doc.activeChapterId;

    // If a target chapter is specified, find it and set it as active
    if (targetChapterId) {
      const targetChapter = doc.chapters.find((c) => c.id === targetChapterId);
      if (targetChapter) {
        editorContent = targetChapter.content;
        activeChapterId = targetChapterId;
      }
    } else if (activeChapterId) {
      // No target chapter specified, but doc has an active chapter - load it
      const activeChapter = doc.chapters.find((c) => c.id === activeChapterId);
      if (activeChapter) {
        editorContent = activeChapter.content;
      }
    }

    // Update doc with active chapter
    doc = { ...doc, activeChapterId };

    setCurrentDoc(doc);
    setEditorState(editorContent);
    setHistory(doc.history);
    setDocPrompt(doc.prompt);
    localStorage.setItem(docId, JSON.stringify(doc));
    localStorage.setItem("selectedDocId", docId);
    setIsDocDrawerOpen(false);
  };

  const saveDoc = (_editorState: string, _history: ChatHistory[]) => {
    if (!currentDoc) return;

    // If there's an active chapter, save content to the chapter
    let updatedChapters = currentDoc.chapters || [];
    if (currentDoc.activeChapterId) {
      updatedChapters = updatedChapters.map((c) =>
        c.id === currentDoc.activeChapterId
          ? { ...c, content: _editorState, updatedAt: Date.now() }
          : c
      );
    }

    const doc: Doc = {
      ...currentDoc,
      data: _editorState,
      chapters: updatedChapters,
      history: _history,
      updatedAt: +new Date(),
    };
    setCurrentDoc(doc);
    localStorage.setItem("doc-" + currentDoc.id, JSON.stringify(doc));
    console.log("saved", "doc-" + currentDoc.id);
  };

  const onSaveDocPrompt = (prompt: string) => {
    if (!currentDoc) return;
    const doc: Doc = { ...currentDoc, prompt };
    setCurrentDoc(doc);
    localStorage.setItem("doc-" + currentDoc.id, JSON.stringify(doc));
    console.log("saved", "doc-" + currentDoc.id);
  };

  const onTitleChange = (title: string) => {
    if (!currentDoc) return;
    console.log("TITLE", title);
    const doc: Doc = { ...currentDoc, title };
    localStorage.setItem("doc-" + currentDoc.id, JSON.stringify(doc));
    console.log("saved", "doc-" + currentDoc.id);
    const _docs = docs.map((obj) => {
      if (obj.id == "doc-" + currentDoc.id) {
        return { ...obj, title };
      }
      return obj;
    });
    setDocs(_docs);
    localStorage.setItem("docs", JSON.stringify(_docs));
  };

  // Toggle expansion of a document in the drawer to show chapters
  const toggleDocExpansion = (docId: string) => {
    setExpandedDocs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // Get chapters for a specific document from localStorage
  const getDocChapters = (docId: string): Chapter[] => {
    const docData = localStorage.getItem(docId);
    if (!docData) return [];
    const doc = JSON.parse(docData) as Doc;
    return doc.chapters || [];
  };

  // Add a new chapter to the current document
  const onAddChapter = (type: ChapterType = 'chapter') => {
    if (!currentDoc) return;

    // Save current editor state to the active chapter first
    let chapters = currentDoc.chapters || [];
    if (currentDoc.activeChapterId) {
      chapters = chapters.map((c) =>
        c.id === currentDoc.activeChapterId
          ? { ...c, content: editorState, updatedAt: Date.now() }
          : c
      );
    }

    const position = chapters.length;
    const newChapter = createChapter(
      type,
      `${type.charAt(0).toUpperCase() + type.slice(1)} ${position + 1}`,
      position
    );

    const updatedDoc: Doc = {
      ...currentDoc,
      chapters: [...chapters, newChapter],
      activeChapterId: newChapter.id,
    };

    setCurrentDoc(updatedDoc);
    setEditorState(newChapter.content);
    localStorage.setItem("doc-" + currentDoc.id, JSON.stringify(updatedDoc));
  };

  // Select a chapter to edit
  const onSelectChapter = (chapterId: string) => {
    if (!currentDoc) return;

    const chapter = currentDoc.chapters?.find((c) => c.id === chapterId);
    if (!chapter) return;

    // Save current editor state to the previous active chapter
    let updatedChapters = currentDoc.chapters || [];
    if (currentDoc.activeChapterId && currentDoc.activeChapterId !== chapterId) {
      updatedChapters = updatedChapters.map((c) =>
        c.id === currentDoc.activeChapterId
          ? { ...c, content: editorState, updatedAt: Date.now() }
          : c
      );
    }

    // Update active chapter and load its content
    const updatedDoc: Doc = {
      ...currentDoc,
      chapters: updatedChapters,
      activeChapterId: chapterId,
    };

    setCurrentDoc(updatedDoc);
    setEditorState(chapter.content);
    localStorage.setItem("doc-" + currentDoc.id, JSON.stringify(updatedDoc));
  };

  // Delete a chapter from the current document
  const onDeleteChapter = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentDoc) return;

    const chapters = currentDoc.chapters?.filter((c) => c.id !== chapterId) || [];
    const newActiveId = chapters.length > 0 ? chapters[0].id : undefined;

    const updatedDoc: Doc = {
      ...currentDoc,
      chapters,
      activeChapterId: newActiveId,
    };

    if (newActiveId) {
      const newActiveChapter = chapters.find((c) => c.id === newActiveId);
      if (newActiveChapter) {
        setEditorState(newActiveChapter.content);
      }
    }

    setCurrentDoc(updatedDoc);
    localStorage.setItem("doc-" + currentDoc.id, JSON.stringify(updatedDoc));
  };

  // Get icon for chapter type
  const getChapterIcon = (type: ChapterType) => {
    switch (type) {
      case 'act':
        return <FiFolder className="w-3 h-3" />;
      case 'scene':
        return <FiFilm className="w-3 h-3" />;
      default:
        return <FiFileText className="w-3 h-3" />;
    }
  };

  function downloadObjectAsJson(exportObj: any, exportName: string) {
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const onExport = () => {
    downloadObjectAsJson(
      localStorage,
      "narrativenest-export-" + new Date().toISOString()
    );
  };

  const onImportChange = (event: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      const result = e?.target?.result as string;
      const data = JSON.parse(result);
      for (const key in data) {
        localStorage.setItem(key, data[key]);
      }
      window.location.reload();
    };
  };

  return (
    <DocumentProvider>
      <DocumentSync currentDoc={currentDoc} />
      <TitleProvider>
        <div className="h-full flex flex-col overflow-hidden">
        {/* Header with Breadcrumb and Actions */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-primary-700/30">
          <div className="flex items-center justify-between mb-4">
            <Breadcrumb items={[{ label: 'Editor' }]} />
            <div className="flex items-center gap-2">
              {!isDistractionFree && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDocDrawerOpen(!isDocDrawerOpen)}
                    data-tour="documents"
                  >
                    <FiFileText className="mr-2" />
                    Documents
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsStoryGenOpen(!isStoryGenOpen)}
                    data-tour="story-generator"
                  >
                    <FiBook className="mr-2" />
                    Story Generator
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDistractionFree(!isDistractionFree);
                  if (!isDistractionFree) {
                    setIsDocDrawerOpen(false);
                    setIsStoryGenOpen(false);
                  }
                }}
              >
                {isDistractionFree ? <FiEye className="mr-2" /> : <FiEyeOff className="mr-2" />}
                {isDistractionFree ? 'Show All' : 'Focus Mode'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTypewriterMode(!isTypewriterMode)}
                className={isTypewriterMode ? 'text-accent-400' : ''}
              >
                <FiAlignCenter className="mr-2" />
                Typewriter
              </Button>
              {!isDistractionFree && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => setIsSettingsOpen(true)}
                  data-tour="settings"
                >
                  <FiSettings />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Drawer */}
          {!isDistractionFree && isDocDrawerOpen && (
            <div className="w-64 flex-shrink-0 border-r border-primary-700/30 overflow-y-auto">
              <div className="p-4 space-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={onCreateDoc}
                >
                  <FiPlus className="mr-2" />
                  New Document
                </Button>

                <div className="space-y-1">
                  {docs.map((item, i) => {
                    const isSelected = currentDoc && "doc-" + currentDoc.id === item.id;
                    const isExpanded = expandedDocs.has(item.id);
                    const chapters = getDocChapters(item.id);
                    const hasChapters = chapters.length > 0;

                    return (
                      <div key={item.id}>
                        {/* Document Item */}
                        <div
                          className={`
                            flex items-center gap-1 px-2 py-2 rounded-xl text-sm transition-colors cursor-pointer
                            ${isSelected
                              ? 'bg-accent-700/20 text-white border border-accent-600/30'
                              : 'text-neutral-300 hover:bg-primary-800'
                            }
                          `}
                        >
                          {/* Expand/Collapse toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDocExpansion(item.id);
                            }}
                            className="p-1 rounded hover:bg-primary-700/50 transition-colors"
                          >
                            {isExpanded ? (
                              <FiChevronDown className="w-3 h-3" />
                            ) : (
                              <FiChevronRight className="w-3 h-3" />
                            )}
                          </button>

                          {/* Document title - clickable */}
                          <button
                            onClick={() => onSelectDoc(item.id)}
                            className="flex-1 text-left flex items-center gap-2 truncate"
                          >
                            <FiFileText className="flex-shrink-0 w-4 h-4" />
                            <span className="truncate">{item.title}</span>
                          </button>

                          {/* Chapter count badge */}
                          {hasChapters && (
                            <span className="text-xs text-neutral-500 px-1.5 py-0.5 bg-primary-800 rounded">
                              {chapters.length}
                            </span>
                          )}
                        </div>

                        {/* Chapters List (when expanded) */}
                        {isExpanded && hasChapters && (
                          <div className="ml-4 mt-1 space-y-0.5 border-l border-primary-700/30 pl-2">
                            {chapters.map((chapter) => (
                              <button
                                key={chapter.id}
                                onClick={() => {
                                  if (isSelected) {
                                    // Same document - just switch chapters
                                    onSelectChapter(chapter.id);
                                  } else {
                                    // Different document - load doc with target chapter
                                    onSelectDoc(item.id, chapter.id);
                                  }
                                }}
                                className={`
                                  w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors group
                                  ${isSelected && currentDoc?.activeChapterId === chapter.id
                                    ? 'bg-accent-700/30 text-white'
                                    : 'text-neutral-400 hover:text-white hover:bg-primary-800'
                                  }
                                `}
                              >
                                {getChapterIcon(chapter.type)}
                                <span className="flex-1 truncate text-left">{chapter.title}</span>
                                <span className="text-[10px] text-neutral-500 capitalize">{chapter.type}</span>
                                {isSelected && (
                                  <button
                                    onClick={(e) => onDeleteChapter(chapter.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-red-400 transition-all"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Add Chapter button (when expanded and is selected doc) */}
                        {isExpanded && isSelected && (
                          <div className="ml-4 mt-1 border-l border-primary-700/30 pl-2 space-y-0.5">
                            {!hasChapters && (
                              <p className="px-2 py-1 text-[10px] text-neutral-500">
                                No chapters yet
                              </p>
                            )}
                            <button
                              onClick={() => onAddChapter('chapter')}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-white hover:bg-primary-800 transition-colors"
                            >
                              <FiPlus className="w-3 h-3" />
                              Add Chapter
                            </button>
                            <button
                              onClick={() => onAddChapter('scene')}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-white hover:bg-primary-800 transition-colors"
                            >
                              <FiPlus className="w-3 h-3" />
                              Add Scene
                            </button>
                            <button
                              onClick={() => onAddChapter('act')}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-white hover:bg-primary-800 transition-colors"
                            >
                              <FiPlus className="w-3 h-3" />
                              Add Act
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-primary-700/30 space-y-2">
                  <button
                    onClick={onExport}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-300 hover:bg-primary-800 transition-colors"
                  >
                    <FiDownload />
                    Export
                  </button>
                  <input
                    id="import-file"
                    className="sr-only"
                    tabIndex={-1}
                    type="file"
                    accept=".json"
                    onChange={onImportChange}
                  />
                  <button
                    onClick={() => {
                      const importFile = document.querySelector(
                        "#import-file"
                      ) as HTMLInputElement;
                      if (importFile) {
                        importFile.click();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-300 hover:bg-primary-800 transition-colors"
                  >
                    <FiUpload />
                    Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            {currentDoc !== null && (
              <Editor
                key={`${currentDoc.id}-${currentDoc.activeChapterId || 'main'}`}
                editorState={editorState}
                onCreateChat={onCreateChat}
                onChange={onChange}
                history={history}
                setting={setting}
                onTitleChange={onTitleChange}
                isDistractionFree={isDistractionFree}
                isTypewriterMode={isTypewriterMode}
                chapters={currentDoc.chapters || []}
                activeChapterId={currentDoc.activeChapterId}
                onSelectChapter={onSelectChapter}
                onAddChapter={onAddChapter}
                userPlugins={userPlugins}
              />
            )}
          </div>
        </div>

        {/* Story Generator Panel */}
        {!isDistractionFree && isStoryGenOpen && (
          <div className="flex-shrink-0 border-t border-primary-700/30 max-h-[50vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">AI Story Generator</h2>
                <button
                  onClick={() => setIsStoryGenOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors"
                >
                  <FiX />
                </button>
              </div>

              <div className="space-y-6 max-w-5xl mx-auto">
                {/* Step 1: Enter Logline and Genre */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">Setup Your Story</h3>
                  </div>
                  <SiderbarLeft />
                </div>

                {/* Step 2: Generate Title */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">Generate Title</h3>
                  </div>
                  <GenerateTitle />
                </div>

                {/* Step 3: Generate Characters */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">Generate Characters</h3>
                  </div>
                  <CharacterComp />
                </div>

                {/* Step 4: Generate Plot/Scenes */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">Generate Scenes</h3>
                  </div>
                  <GeneratePlot />
                </div>

                {/* Step 5: Generate Place Descriptions */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      5
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">Generate Places</h3>
                  </div>
                  <GeneratePlace />
                </div>

                {/* Step 6: Generate Dialogues */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      6
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">Generate Dialogues</h3>
                  </div>
                  <GenerateDialogues />
                </div>

                {/* Step 7: Render Final Story */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-700 text-white flex items-center justify-center font-semibold text-sm">
                      7
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200">View Complete Story</h3>
                  </div>
                  <RenderStory />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal
          title="Prompts"
          isOpen={isPromptsOpen}
          setIsOpen={setIsPromptsOpen}
        >
          <Prompts
            setIsOpen={setIsPromptsOpen}
            docPrompt={docPrompt}
            setDocPrompt={setDocPrompt}
            setting={setting}
            setSetting={setSetting}
            onSaveDocPrompt={onSaveDocPrompt}
          />
        </Modal>

        <Modal
          title="Settings"
          isOpen={isSettingsOpen}
          setIsOpen={setIsSettingsOpen}
        >
          <Settings
            setIsOpen={setIsSettingsOpen}
            setting={setting}
            setSetting={setSetting}
          />
        </Modal>

        {/* Welcome Modal for first-time users */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
          onStartTour={handleStartTour}
          onLoadDemo={loadDemoDocument}
        />

        {/* Onboarding Tour */}
        {isTourActive && (
          <OnboardingTourWrapper
            isActive={isTourActive}
            onStop={() => setIsTourActive(false)}
          />
        )}
        </div>
      </TitleProvider>
    </DocumentProvider>
  );
}

// Simple tour wrapper component
function OnboardingTourWrapper({
  isActive,
  onStop
}: {
  isActive: boolean;
  onStop: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  const TOUR_STEPS = [
    {
      target: '.editor-contenteditable',
      title: 'Your Writing Space',
      content: 'This is your main editor. Write, edit, and format your screenplay here.',
    },
    {
      target: '.toolbar-container',
      title: 'Formatting Toolbar',
      content: 'Use the toolbar for text formatting, headings, lists, and more.',
    },
    {
      target: '.editor-contenteditable',
      title: 'Slash Commands',
      content: 'Type "/" anywhere to open the command menu for quick formatting and AI actions.',
    },
    {
      target: '.editor-contenteditable',
      title: 'Magic Wand',
      content: 'Select text to reveal the Magic Wand for AI-powered rewrites and transformations.',
    },
    {
      target: '[data-tour="story-generator"]',
      title: 'Story Generator',
      content: 'Generate complete story outlines from a simple logline - titles, characters, scenes, and dialogues.',
    },
    {
      target: '[data-tour="documents"]',
      title: 'Document Management',
      content: 'Organize your work with documents and chapters. Expand documents to see their chapters.',
    },
    {
      target: '[data-tour="settings"]',
      title: 'Settings & Plugins',
      content: 'Configure API keys, model preferences, and create custom plugins for the slash menu.',
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onStop();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            onStop();
          }
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep, onStop]);

  if (!mounted || !isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onStop}
      />

      {/* Tour tooltip - positioned in center for simplicity */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw]">
        <div className="bg-primary-900 rounded-2xl border border-primary-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-accent-700/20 border-b border-primary-700/30">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-medium bg-accent-600/30 text-accent-300 rounded-full">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
              <h3 className="font-semibold text-white">{step.title}</h3>
            </div>
            <button
              onClick={onStop}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors"
              aria-label="Close tour"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            <p className="text-neutral-300 leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 bg-primary-800/30 border-t border-primary-700/30">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={isFirstStep}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors
                ${isFirstStep
                  ? 'text-neutral-600 cursor-not-allowed'
                  : 'text-neutral-400 hover:text-white hover:bg-primary-700'
                }
              `}
            >
              <FiChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`
                    w-2 h-2 rounded-full transition-colors
                    ${index === currentStep
                      ? 'bg-accent-500'
                      : index < currentStep
                        ? 'bg-accent-700'
                        : 'bg-primary-700'
                    }
                  `}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm bg-accent-600 hover:bg-accent-500 text-white font-medium transition-colors"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-accent-400 hover:text-white hover:bg-accent-700/30 transition-colors"
              >
                Next
                <FiChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
