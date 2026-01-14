'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import {
  FiEye,
  FiBarChart2,
  FiDollarSign,
  FiGlobe,
  FiUsers,
  FiActivity,
  FiRefreshCw,
  FiChevronRight,
  FiAlertTriangle,
  FiInfo,
  FiCheck,
} from 'react-icons/fi'
import type {
  AnalysisMode,
  DirectorLensState,
  WritingMetrics,
  BudgetSummary,
  CulturalSummary,
  ThemeAnalysis,
} from './types'
import {
  analyzeWritingMetrics,
  getReadabilityGrade,
  getMetricsSummary,
} from './utils/metricsAnalyzer'
import { analyzeBudget, getCategoryIcon, getAlertColor } from './utils/budgetAnalyzer'
import {
  analyzeCulturalContent,
  getCultureColor,
  getNoteTypeIcon,
} from './utils/culturalAnalyzer'

interface DirectorLensProps {
  onInsertToEditor?: (content: string) => void
}

const initialState: DirectorLensState = {
  isEnabled: true,
  activeMode: 'overview',
  isAnalyzing: false,
  metrics: null,
  themes: null,
  characters: [],
  characterProfiles: [],
  structure: null,
  budget: null,
  cultural: null,
  lastAnalyzed: null,
}

export function DirectorLensPanel({ onInsertToEditor }: DirectorLensProps) {
  const [editor] = useLexicalComposerContext()
  const [state, setState] = useState<DirectorLensState>(initialState)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  // Get document content
  const getContent = useCallback(() => {
    let content = ''
    editor.getEditorState().read(() => {
      content = $convertToMarkdownString(TRANSFORMERS)
    })
    return content
  }, [editor])

  // Run analysis
  const runAnalysis = useCallback(async () => {
    setState((prev) => ({ ...prev, isAnalyzing: true }))

    const content = getContent()

    // Run local analyzers
    const metrics = analyzeWritingMetrics(content)
    const budget = analyzeBudget(content)
    const cultural = analyzeCulturalContent(content)

    // Run AI theme analysis
    let themes: ThemeAnalysis | null = null
    if (content.trim().length > 100) {
      try {
        const response = await fetch('/api/writer2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are a literary analyst. Analyze the following text and identify:
1. Main themes (3-5 themes with confidence scores 0-100)
2. Recurring motifs
3. Overall tone
4. Genre classification

Respond in this exact JSON format:
{
  "themes": [{"name": "theme name", "confidence": 85, "evidence": ["quote or reference"]}],
  "motifs": ["motif1", "motif2"],
  "tone": "overall tone",
  "genre": "genre classification"
}`,
              },
              { role: 'user', content: content.substring(0, 3000) },
            ],
            temperature: 0.3,
            maxTokens: 500,
          }),
        })

        if (response.ok) {
          const reader = response.body?.getReader()
          if (reader) {
            const decoder = new TextDecoder()
            let result = ''
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              result += decoder.decode(value, { stream: true })
            }
            result += decoder.decode()

            // Try to parse JSON from response
            const jsonMatch = result.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              themes = JSON.parse(jsonMatch[0])
            }
          }
        }
      } catch (error) {
        console.warn('Theme analysis failed:', error)
      }
    }

    setState((prev) => ({
      ...prev,
      isAnalyzing: false,
      metrics,
      budget,
      cultural,
      themes,
      lastAnalyzed: Date.now(),
    }))
  }, [getContent])

  // Auto-analyze on mount
  useEffect(() => {
    runAnalysis()
  }, [])

  const modes: { id: AnalysisMode; label: string; icon: typeof FiEye }[] = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'budget', label: 'Budget', icon: FiDollarSign },
    { id: 'cultural', label: 'Cultural', icon: FiGlobe },
    { id: 'characters', label: 'Characters', icon: FiUsers },
    { id: 'structure', label: 'Structure', icon: FiActivity },
  ]

  return (
    <div className="h-full flex flex-col bg-primary-950">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-primary-700/30 bg-primary-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/20 flex items-center justify-center">
              <FiEye className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Director&apos;s Lens</h3>
              <p className="text-xs text-neutral-400">Script Analysis</p>
            </div>
          </div>
          <button
            onClick={runAnalysis}
            disabled={state.isAnalyzing}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors disabled:opacity-50"
            title="Re-analyze"
          >
            <FiRefreshCw className={`w-4 h-4 ${state.isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setState((prev) => ({ ...prev, activeMode: mode.id }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                state.activeMode === mode.id
                  ? 'bg-emerald-700/30 text-emerald-400 border border-emerald-600/30'
                  : 'text-neutral-400 hover:text-white hover:bg-primary-800'
              }`}
            >
              <mode.icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiRefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">Analyzing script...</p>
            </div>
          </div>
        ) : (
          <>
            {state.activeMode === 'overview' && (
              <OverviewPanel metrics={state.metrics} themes={state.themes} />
            )}
            {state.activeMode === 'budget' && (
              <BudgetPanel
                budget={state.budget}
                expandedAlert={expandedAlert}
                setExpandedAlert={setExpandedAlert}
              />
            )}
            {state.activeMode === 'cultural' && (
              <CulturalPanel
                cultural={state.cultural}
                expandedAlert={expandedAlert}
                setExpandedAlert={setExpandedAlert}
              />
            )}
            {state.activeMode === 'characters' && (
              <CharactersPanel themes={state.themes} />
            )}
            {state.activeMode === 'structure' && (
              <StructurePanel themes={state.themes} metrics={state.metrics} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Overview Panel
function OverviewPanel({
  metrics,
  themes,
}: {
  metrics: WritingMetrics | null
  themes: ThemeAnalysis | null
}) {
  if (!metrics) return <EmptyState message="No content to analyze" />

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Words" value={metrics.wordCount.toLocaleString()} />
        <StatCard label="Read Time" value={metrics.estimatedReadTime} />
        <StatCard
          label="Readability"
          value={`${metrics.readabilityScore}/100`}
          subtitle={getReadabilityGrade(metrics.readabilityScore)}
        />
        <StatCard
          label="Dialogue"
          value={`${metrics.dialoguePercentage}%`}
          subtitle={`Action: ${metrics.actionPercentage}%`}
        />
      </div>

      {/* Themes */}
      {themes && themes.themes && themes.themes.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-primary-700/30">
          <h4 className="text-sm font-semibold text-white mb-3">Detected Themes</h4>
          <div className="space-y-2">
            {themes.themes.map((theme, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-200">{theme.name}</span>
                    <span className="text-xs text-neutral-400">{theme.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-primary-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${theme.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tone & Genre */}
      {themes && (
        <div className="grid grid-cols-2 gap-3">
          {themes.tone && (
            <div className="glass-card rounded-xl p-3 border border-primary-700/30">
              <p className="text-xs text-neutral-400 mb-1">Tone</p>
              <p className="text-sm font-medium text-white">{themes.tone}</p>
            </div>
          )}
          {themes.genre && (
            <div className="glass-card rounded-xl p-3 border border-primary-700/30">
              <p className="text-xs text-neutral-400 mb-1">Genre</p>
              <p className="text-sm font-medium text-white">{themes.genre}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Budget Panel
function BudgetPanel({
  budget,
  expandedAlert,
  setExpandedAlert,
}: {
  budget: BudgetSummary | null
  expandedAlert: string | null
  setExpandedAlert: (id: string | null) => void
}) {
  if (!budget) return <EmptyState message="No content to analyze" />

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card rounded-xl p-4 border border-primary-700/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Budget Estimate</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-900/30 text-amber-400">
            {budget.estimatedBudgetRange}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-red-900/20">
            <p className="text-lg font-bold text-red-400">{budget.highCostItems}</p>
            <p className="text-xs text-neutral-400">High Cost</p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-900/20">
            <p className="text-lg font-bold text-yellow-400">{budget.moderateCostItems}</p>
            <p className="text-xs text-neutral-400">Moderate</p>
          </div>
          <div className="p-2 rounded-lg bg-primary-800/50">
            <p className="text-lg font-bold text-neutral-300">{budget.totalAlerts}</p>
            <p className="text-xs text-neutral-400">Total Alerts</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {budget.alerts.length === 0 ? (
        <div className="text-center py-8">
          <FiCheck className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-neutral-300">No expensive elements detected</p>
          <p className="text-xs text-neutral-500 mt-1">Your script is budget-friendly!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {budget.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border overflow-hidden ${getAlertColor(alert.type)}`}
            >
              <button
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <span className="text-lg">{getCategoryIcon(alert.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{alert.element}</span>
                    <span className="text-xs opacity-75">Line {alert.lineNumber}</span>
                  </div>
                  <p className="text-xs opacity-75 truncate">{alert.estimatedCost}</p>
                </div>
                <FiChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedAlert === alert.id ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {expandedAlert === alert.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-current/10">
                  <p className="text-xs pt-2">{alert.reason}</p>
                  <div className="bg-primary-900/50 rounded-lg p-2">
                    <p className="text-xs text-neutral-400 mb-1">Budget-friendly alternatives:</p>
                    <ul className="text-xs space-y-1">
                      {alert.alternatives.map((alt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-400">→</span>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Cultural Panel
function CulturalPanel({
  cultural,
  expandedAlert,
  setExpandedAlert,
}: {
  cultural: CulturalSummary | null
  expandedAlert: string | null
  setExpandedAlert: (id: string | null) => void
}) {
  if (!cultural) return <EmptyState message="No content to analyze" />

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card rounded-xl p-4 border border-primary-700/30">
        <h4 className="text-sm font-semibold text-white mb-3">Cultural Analysis</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-amber-900/20 text-center">
            <p className="text-lg font-bold text-amber-400">{cultural.corrections}</p>
            <p className="text-xs text-neutral-400">Corrections</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-900/20 text-center">
            <p className="text-lg font-bold text-blue-400">{cultural.suggestions}</p>
            <p className="text-xs text-neutral-400">Suggestions</p>
          </div>
        </div>
      </div>

      {/* Cultural Notes */}
      {cultural.notes.length === 0 ? (
        <div className="text-center py-8">
          <FiCheck className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-neutral-300">No cultural issues detected</p>
          <p className="text-xs text-neutral-500 mt-1">Great attention to authenticity!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cultural.notes.map((note) => (
            <div
              key={note.id}
              className={`rounded-xl border border-primary-700/30 overflow-hidden ${getCultureColor(
                note.culture
              )}`}
            >
              <button
                onClick={() => setExpandedAlert(expandedAlert === note.id ? null : note.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <span className="text-lg">{getNoteTypeIcon(note.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-current/20 capitalize">
                      {note.culture.replace('-', ' ')}
                    </span>
                    <span className="text-xs opacity-75">Line {note.lineNumber}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{note.issue}</p>
                </div>
                <FiChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedAlert === note.id ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {expandedAlert === note.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-current/10">
                  <p className="text-xs pt-2 opacity-90">{note.explanation}</p>
                  {note.authenticAlternative && (
                    <div className="bg-primary-900/50 rounded-lg p-2">
                      <p className="text-xs text-green-400 mb-1">✓ Authentic alternative:</p>
                      <p className="text-xs italic">{note.authenticAlternative}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Characters Panel (placeholder)
function CharactersPanel({ themes }: { themes: ThemeAnalysis | null }) {
  return (
    <div className="text-center py-8">
      <FiUsers className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
      <p className="text-neutral-300">Character Analysis</p>
      <p className="text-xs text-neutral-500 mt-1">
        Highlight a character name in the editor to see their profile
      </p>
    </div>
  )
}

// Structure Panel (placeholder)
function StructurePanel({
  themes,
  metrics,
}: {
  themes: ThemeAnalysis | null
  metrics: WritingMetrics | null
}) {
  return (
    <div className="text-center py-8">
      <FiActivity className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
      <p className="text-neutral-300">Story Structure</p>
      <p className="text-xs text-neutral-500 mt-1">
        Three-act structure and pacing analysis coming soon
      </p>
    </div>
  )
}

// Helper Components
function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string
  value: string
  subtitle?: string
}) {
  return (
    <div className="glass-card rounded-xl p-3 border border-primary-700/30">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <FiInfo className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-400 text-sm">{message}</p>
      </div>
    </div>
  )
}

export default DirectorLensPanel
