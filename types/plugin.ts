/**
 * User Plugin types for custom actions
 */

export interface UserPlugin {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string; // Icon name from react-icons (e.g., 'FiStar', 'FiZap')
  category: 'ai-actions' | 'custom';
  keywords: string[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PluginState {
  plugins: UserPlugin[];
  isLoading: boolean;
}

export const DEFAULT_PLUGIN_ICONS = [
  'FiStar',
  'FiZap',
  'FiFeather',
  'FiEdit3',
  'FiMessageCircle',
  'FiBookOpen',
  'FiUsers',
  'FiGlobe',
  'FiHeart',
  'FiBold',
  'FiItalic',
  'FiList',
  'FiCode',
  'FiCoffee',
  'FiSun',
  'FiMoon',
  'FiMusic',
  'FiCamera',
  'FiFilm',
  'FiMic',
] as const;

export type PluginIconName = typeof DEFAULT_PLUGIN_ICONS[number];

// Sample plugins for users to get started
export const SAMPLE_PLUGINS: UserPlugin[] = [
  {
    id: 'sample-sensory-details',
    name: 'Add Sensory Details',
    description: 'Enhance text with sight, sound, smell, taste, and touch details',
    prompt: 'Enhance the following text by adding vivid sensory details (sight, sound, smell, taste, touch) to make it more immersive. Keep the original meaning but make the reader feel present in the scene.',
    icon: 'FiSun',
    category: 'ai-actions',
    keywords: ['sensory', 'details', 'describe', 'vivid', 'immersive'],
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-conflict-escalate',
    name: 'Escalate Conflict',
    description: 'Increase tension and stakes in dialogue or scene',
    prompt: 'Rewrite the following to escalate the conflict and raise the stakes. Add more tension, urgency, and emotional intensity while keeping the same characters and basic situation.',
    icon: 'FiZap',
    category: 'ai-actions',
    keywords: ['conflict', 'tension', 'escalate', 'stakes', 'drama'],
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-inner-monologue',
    name: 'Add Inner Monologue',
    description: 'Add character internal thoughts and reflections',
    prompt: 'Add inner monologue and internal thoughts to this text. Show what the main character is thinking and feeling beneath the surface action. Use italics for direct thoughts.',
    icon: 'FiMessageCircle',
    category: 'ai-actions',
    keywords: ['thoughts', 'inner', 'monologue', 'internal', 'feelings'],
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
