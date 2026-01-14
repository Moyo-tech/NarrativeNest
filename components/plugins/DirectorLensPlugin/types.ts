/**
 * Director's Lens - Analysis & Reporting Types
 * Non-invasive script analysis for Nigerian screenwriting
 */

export type AnalysisMode = 'overview' | 'budget' | 'cultural' | 'characters' | 'structure'

export interface WritingMetrics {
  wordCount: number
  characterCount: number
  sentenceCount: number
  paragraphCount: number
  averageSentenceLength: number
  readabilityScore: number // Flesch-Kincaid
  dialoguePercentage: number
  actionPercentage: number
  estimatedReadTime: string
}

export interface ThemeAnalysis {
  themes: Theme[]
  motifs: string[]
  tone: string
  genre: string
}

export interface Theme {
  name: string
  confidence: number // 0-100
  evidence: string[]
}

export interface CharacterMention {
  name: string
  count: number
  dialogueLines: number
  firstAppearance: number // line number
  scenes: number[]
}

export interface CharacterProfile {
  id: string
  name: string
  role: string
  age?: string
  motivation?: string
  secret?: string
  voicePattern?: string
  arcType?: string
  dialogueStyle?: string
}

export interface StoryBeat {
  id: string
  type: 'setup' | 'inciting-incident' | 'rising-action' | 'midpoint' | 'climax' | 'resolution'
  position: number // percentage through script
  description: string
  lineRange: [number, number]
}

export interface StructureAnalysis {
  acts: ActBreakdown[]
  beats: StoryBeat[]
  pacingScore: number // 0-100
  pacingNotes: string[]
}

export interface ActBreakdown {
  act: 1 | 2 | 3
  startLine: number
  endLine: number
  percentage: number
  beats: StoryBeat[]
}

// Budget Analysis Types (Nigerian Production Focus)
export interface BudgetAlert {
  id: string
  type: 'expensive' | 'moderate' | 'caution'
  element: string
  lineNumber: number
  lineContent: string
  estimatedCost: string // e.g., "₦8-15 million"
  reason: string
  alternatives: string[]
  category: BudgetCategory
}

export type BudgetCategory =
  | 'vfx'           // Explosions, CGI
  | 'stunts'        // Action sequences
  | 'location'      // Expensive locations, permits
  | 'crowd'         // Large crowd scenes
  | 'night'         // Night shoots
  | 'vehicle'       // Car chases, vehicle scenes
  | 'period'        // Period costumes/props
  | 'celebrity'     // A-list cameos mentioned
  | 'animal'        // Animal handlers
  | 'water'         // Water/rain scenes

export interface BudgetSummary {
  totalAlerts: number
  estimatedBudgetRange: string
  highCostItems: number
  moderateCostItems: number
  alerts: BudgetAlert[]
}

// Cultural Analysis Types (Nigerian Cultural Protocol)
export interface CulturalNote {
  id: string
  type: 'correction' | 'suggestion' | 'info'
  culture: 'igbo' | 'yoruba' | 'hausa' | 'general-nigerian' | 'lagos' | 'pidgin'
  element: string
  lineNumber: number
  lineContent: string
  issue: string
  explanation: string
  authenticAlternative?: string
  learnMoreUrl?: string
}

export interface CulturalSummary {
  totalNotes: number
  corrections: number
  suggestions: number
  culturalElements: {
    igbo: number
    yoruba: number
    hausa: number
    pidgin: number
    general: number
  }
  notes: CulturalNote[]
}

// Director's Lens State
export interface DirectorLensState {
  isEnabled: boolean
  activeMode: AnalysisMode
  isAnalyzing: boolean
  metrics: WritingMetrics | null
  themes: ThemeAnalysis | null
  characters: CharacterMention[]
  characterProfiles: CharacterProfile[]
  structure: StructureAnalysis | null
  budget: BudgetSummary | null
  cultural: CulturalSummary | null
  lastAnalyzed: number | null
}

// Analysis Request/Response
export interface AnalysisRequest {
  content: string
  type: AnalysisMode | 'full'
}

export interface AnalysisResponse {
  metrics?: WritingMetrics
  themes?: ThemeAnalysis
  characters?: CharacterMention[]
  structure?: StructureAnalysis
  budget?: BudgetSummary
  cultural?: CulturalSummary
}
