/**
 * Budget Analyzer for Nigerian Productions
 * Identifies expensive elements and suggests alternatives
 */

import type { BudgetAlert, BudgetCategory, BudgetSummary } from '../types'
import { nanoid } from 'nanoid'

interface BudgetPattern {
  pattern: RegExp
  category: BudgetCategory
  type: 'expensive' | 'moderate' | 'caution'
  estimatedCost: string
  reason: string
  alternatives: string[]
}

// Nigerian production cost patterns
const BUDGET_PATTERNS: BudgetPattern[] = [
  // VFX / Explosions
  {
    pattern: /\b(explod(es?|ing)|explosion|blast|bomb|detonate|fire\s*ball)\b/gi,
    category: 'vfx',
    type: 'expensive',
    estimatedCost: '₦8-15 million',
    reason: 'VFX explosion + safety crew + permits + multiple takes',
    alternatives: [
      'Show character reacting to off-screen explosion',
      'Use practical smoke and sound design',
      'Cut to aftermath instead of showing explosion',
    ],
  },
  {
    pattern: /\b(cgi|visual\s*effect|morph|transform|magic\s*spell|disappear|supernatural)\b/gi,
    category: 'vfx',
    type: 'expensive',
    estimatedCost: '₦5-20 million',
    reason: 'CGI work requires specialized studios and multiple revisions',
    alternatives: [
      'Use practical effects where possible',
      'Suggest through lighting and sound',
      'Show reaction shots instead of effect',
    ],
  },

  // Stunts / Action
  {
    pattern: /\b(car\s*chase|chase\s*scene|high\s*speed|racing|pursuit)\b/gi,
    category: 'vehicle',
    type: 'expensive',
    estimatedCost: '₦10-25 million',
    reason: 'Multiple vehicles + stunt drivers + road closures + safety + insurance',
    alternatives: [
      'Foot chase through market or alley',
      'Keke/Okada chase (lower speed, more authentic)',
      'Cut between driver close-ups and destination',
    ],
  },
  {
    pattern: /\b(fight\s*scene|martial\s*arts|combat|brawl|punch|kick|attack)\b/gi,
    category: 'stunts',
    type: 'moderate',
    estimatedCost: '₦2-5 million',
    reason: 'Stunt coordinator + choreography + multiple takes + safety',
    alternatives: [
      'Focus on emotional confrontation instead',
      'Show beginning and aftermath, skip middle',
      'Use tight shots to reduce stunt complexity',
    ],
  },

  // Crowd Scenes
  {
    pattern: /\b(crowd|hundreds|thousands|mass|mob|army|soldiers|protest|rally|stadium)\b/gi,
    category: 'crowd',
    type: 'expensive',
    estimatedCost: '₦5-15 million',
    reason: 'Extras + catering + costume + crowd control + permits',
    alternatives: [
      'Suggest crowd with sound design and reactions',
      'Use tight shots with 10-20 featured extras',
      'Film at actual event (market, church, etc.)',
    ],
  },

  // Night Shoots
  {
    pattern: /\b(night|midnight|2\s*am|3\s*am|late\s*night|darkness|moonlight)\b/gi,
    category: 'night',
    type: 'moderate',
    estimatedCost: '₦1-3 million per night',
    reason: 'Generator costs + lighting equipment + crew overtime + security',
    alternatives: [
      'Day-for-night with color grading',
      'Dusk/magic hour shooting',
      'Interior night scenes with controlled lighting',
    ],
  },

  // Locations
  {
    pattern: /\b(airport|airplane|private\s*jet|helicopter|yacht|mansion|palace|government\s*house)\b/gi,
    category: 'location',
    type: 'expensive',
    estimatedCost: '₦3-10 million',
    reason: 'Location fees + permits + security clearance + limited shooting hours',
    alternatives: [
      'Use hotel lobby for mansion interior',
      'Exterior only, suggest interior',
      'Build partial set for key scenes',
    ],
  },
  {
    pattern: /\b(lagos\s*island|victoria\s*island|ikoyi|lekki|banana\s*island)\b/gi,
    category: 'location',
    type: 'moderate',
    estimatedCost: '₦500k-2 million per location',
    reason: 'Premium area permits + security + parking + noise restrictions',
    alternatives: [
      'Film in Mainland locations styled as VI',
      'Use actual locations during off-peak hours',
      'Interior studio sets',
    ],
  },

  // Water / Rain
  {
    pattern: /\b(rain|storm|flood|swimming|pool|ocean|beach|river|underwater)\b/gi,
    category: 'water',
    type: 'moderate',
    estimatedCost: '₦2-8 million',
    reason: 'Rain machines + water safety + equipment protection + continuity',
    alternatives: [
      'Wet-down streets instead of active rain',
      'Interior scenes with rain sound effects',
      'Aftermath of rain instead of during',
    ],
  },

  // Period Pieces
  {
    pattern: /\b(1960s|1970s|1980s|colonial|pre-colonial|ancient|traditional\s*village|old\s*lagos)\b/gi,
    category: 'period',
    type: 'expensive',
    estimatedCost: '₦5-15 million',
    reason: 'Period costumes + props + set dressing + vintage vehicles + research',
    alternatives: [
      'Frame story in present day with flashbacks',
      'Focus on indoor scenes requiring less period detail',
      'Use existing cultural villages/museums',
    ],
  },

  // Animals
  {
    pattern: /\b(horse|elephant|lion|snake|dog\s*attack|animals|cattle|goat\s*herd)\b/gi,
    category: 'animal',
    type: 'moderate',
    estimatedCost: '₦1-5 million',
    reason: 'Animal handlers + insurance + multiple takes + unpredictability',
    alternatives: [
      'Sound effects and reaction shots',
      'Partial/practical props',
      'Stock footage with matching shots',
    ],
  },

  // Celebrity Mentions
  {
    pattern: /\b(celebrity|famous|a-list|star|davido|wizkid|genevieve|ramsey\s*nouah)\b/gi,
    category: 'celebrity',
    type: 'caution',
    estimatedCost: 'Variable (₦5-50 million+)',
    reason: 'Talent fees + scheduling + entourage + special requirements',
    alternatives: [
      'Create fictional celebrity character',
      'Use rising talent',
      'Reference celebrity without showing',
    ],
  },
]

/**
 * Analyze script for budget implications
 */
export function analyzeBudget(content: string): BudgetSummary {
  const lines = content.split('\n')
  const alerts: BudgetAlert[] = []
  const seenElements = new Set<string>()

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()

    if (!trimmedLine) return

    for (const pattern of BUDGET_PATTERNS) {
      const matches = trimmedLine.match(pattern.pattern)

      if (matches) {
        // Avoid duplicate alerts for same element on same line
        const elementKey = `${lineNumber}-${pattern.category}`
        if (seenElements.has(elementKey)) continue
        seenElements.add(elementKey)

        alerts.push({
          id: nanoid(),
          type: pattern.type,
          element: matches[0],
          lineNumber,
          lineContent: trimmedLine.substring(0, 100),
          estimatedCost: pattern.estimatedCost,
          reason: pattern.reason,
          alternatives: pattern.alternatives,
          category: pattern.category,
        })
      }
    }
  })

  // Calculate summary
  const highCostItems = alerts.filter(a => a.type === 'expensive').length
  const moderateCostItems = alerts.filter(a => a.type === 'moderate').length

  // Estimate total budget range
  let estimatedBudgetRange = '₦10-30 million (Baseline)'
  if (highCostItems > 5) {
    estimatedBudgetRange = '₦100+ million (High Budget)'
  } else if (highCostItems > 2) {
    estimatedBudgetRange = '₦50-100 million (Medium-High)'
  } else if (highCostItems > 0 || moderateCostItems > 5) {
    estimatedBudgetRange = '₦30-50 million (Medium)'
  }

  return {
    totalAlerts: alerts.length,
    estimatedBudgetRange,
    highCostItems,
    moderateCostItems,
    alerts: alerts.sort((a, b) => {
      // Sort by type priority (expensive first) then by line number
      const typePriority = { expensive: 0, moderate: 1, caution: 2 }
      const priorityDiff = typePriority[a.type] - typePriority[b.type]
      if (priorityDiff !== 0) return priorityDiff
      return a.lineNumber - b.lineNumber
    }),
  }
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: BudgetCategory): string {
  const icons: Record<BudgetCategory, string> = {
    vfx: '💥',
    stunts: '🥊',
    location: '🏛️',
    crowd: '👥',
    night: '🌙',
    vehicle: '🚗',
    period: '📜',
    celebrity: '⭐',
    animal: '🐎',
    water: '💧',
  }
  return icons[category] || '⚠️'
}

/**
 * Get alert color
 */
export function getAlertColor(type: 'expensive' | 'moderate' | 'caution'): string {
  const colors = {
    expensive: 'text-red-400 bg-red-900/20 border-red-700/30',
    moderate: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30',
    caution: 'text-blue-400 bg-blue-900/20 border-blue-700/30',
  }
  return colors[type]
}
