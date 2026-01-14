/**
 * Cultural Protocol Checker for Nigerian Screenwriting
 * Flags potential cultural inaccuracies and suggests authentic alternatives
 */

import type { CulturalNote, CulturalSummary } from '../types'
import { nanoid } from 'nanoid'

interface CulturalPattern {
  pattern: RegExp
  culture: CulturalNote['culture']
  type: CulturalNote['type']
  issue: string
  explanation: string
  authenticAlternative?: string
}

// Nigerian cultural patterns and protocols
const CULTURAL_PATTERNS: CulturalPattern[] = [
  // IGBO Cultural Protocols
  {
    pattern: /\b(bride|woman).*?(carry|bring|hand).*?(palm\s*wine|wine).*?(directly|straight)\b/gi,
    culture: 'igbo',
    type: 'correction',
    issue: 'Direct wine presentation in Igbo wedding',
    explanation: 'In Igbo wine carrying ceremony (Igba Nkwu), the bride must search through the crowd for her groom first, building suspense. She does not go directly to him.',
    authenticAlternative: 'The bride, cup in hand, searches the crowd. Her eyes scan past elders, past friends, until they lock with his. Only then does she approach.',
  },
  {
    pattern: /\b(kola\s*nut).*?(break|split|cut)\b.*?(woman|she|bride|mother)\b/gi,
    culture: 'igbo',
    type: 'correction',
    issue: 'Woman breaking kola nut',
    explanation: 'In Igbo culture, kola nut is traditionally broken by the eldest male present. Women do not break kola, though they may present it.',
    authenticAlternative: 'She presents the kola nut on a wooden plate. The eldest uncle receives it, blesses it, and breaks it for all to share.',
  },
  {
    pattern: /\b(young|son|child).*?(greet|address).*?(elder|father|chief).*?(standing|upright)\b/gi,
    culture: 'igbo',
    type: 'correction',
    issue: 'Youth standing while greeting elder',
    explanation: 'In Igbo culture, younger people traditionally prostrate or kneel (boys) or curtsy (girls) when greeting elders as a sign of respect.',
    authenticAlternative: 'Chidi drops to his knees, touches the ground with his right hand. "Nna anyi, good morning sir."',
  },
  {
    pattern: /\bchiefs?\b.*?\b(red\s*cap|sitting).*?\b(common|regular|ordinary)\b/gi,
    culture: 'igbo',
    type: 'info',
    issue: 'Chief seating arrangement',
    explanation: 'Igbo titled chiefs (Nze na Ozo) have specific seating protocols. Red cap chiefs sit in designated positions, never mixed randomly with non-titled men.',
    authenticAlternative: 'The red cap chiefs occupy the high seats on the left, their eagle feathers catching the light. Below them, the untitled men gather.',
  },

  // YORUBA Cultural Protocols
  {
    pattern: /\b(prostrate|dobale).*?(woman|she|bride|mother|wife)\b/gi,
    culture: 'yoruba',
    type: 'correction',
    issue: 'Woman prostrating in Yoruba culture',
    explanation: 'In Yoruba tradition, only men prostrate (dobale). Women kneel (kunle) with both knees on the ground.',
    authenticAlternative: 'She kneels gracefully, both knees touching the ground, hands folded before her. "E kaaro, Ma."',
  },
  {
    pattern: /\b(oriki|praise\s*poetry).*?(himself|his\s*own)\b/gi,
    culture: 'yoruba',
    type: 'info',
    issue: 'Self-recitation of Oriki',
    explanation: 'Oriki (praise poetry) is traditionally recited by others about a person, not by oneself. Self-recitation can appear boastful.',
    authenticAlternative: 'His mother rises, her voice carrying the ancestral praise: "Omo Ogun, son of warriors, whose father split mountains..."',
  },
  {
    pattern: /\baso\s*oke\b.*?\b(casual|everyday|work)\b/gi,
    culture: 'yoruba',
    type: 'suggestion',
    issue: 'Aso oke for casual wear',
    explanation: 'Aso oke is a ceremonial fabric reserved for important occasions like weddings, funerals, and festivals. It\'s not worn casually.',
    authenticAlternative: 'For everyday scenes, use Ankara, Adire, or simple cotton agbada.',
  },

  // HAUSA Cultural Protocols
  {
    pattern: /\b(unmarried\s*woman|single\s*girl).*?(alone|unaccompanied).*?(man|male|suitor)\b/gi,
    culture: 'hausa',
    type: 'info',
    issue: 'Unchaperoned meeting',
    explanation: 'In traditional Hausa-Fulani culture, unmarried women typically do not meet alone with unrelated men. A chaperone is usually present.',
    authenticAlternative: 'Her younger sister sits in the corner, eyes on her phone but ears sharp. Amina speaks softly to her visitor.',
  },
  {
    pattern: /\bpurdah\b.*?\b(outside|public|market)\b/gi,
    culture: 'hausa',
    type: 'info',
    issue: 'Purdah practice accuracy',
    explanation: 'Women in purdah (kulle) have specific conditions for going outside - typically with permission, proper covering, and for specific purposes.',
    authenticAlternative: 'Consider the character\'s specific family practice - purdah observance varies significantly between families.',
  },

  // NIGERIAN PIDGIN
  {
    pattern: /\bwetin\s+(you\s+)?dey\s+happen\b/gi,
    culture: 'pidgin',
    type: 'suggestion',
    issue: 'Pidgin phrasing',
    explanation: '"Wetin dey happen" is correct but formal. More natural Lagos pidgin often drops words.',
    authenticAlternative: '"Wetin dey?" or "Wetin sup?" for more casual, authentic street dialogue.',
  },
  {
    pattern: /\bhow\s+far\s+now\b/gi,
    culture: 'pidgin',
    type: 'info',
    issue: 'Pidgin greeting context',
    explanation: '"How far" is greeting but "How far now" implies something is expected or overdue. Make sure context matches.',
  },

  // LAGOS / MODERN NIGERIA
  {
    pattern: /\bdanfo\b.*?\b(queue|line|orderly)\b/gi,
    culture: 'lagos',
    type: 'info',
    issue: 'Danfo bus boarding',
    explanation: 'Lagos danfo boarding is characteristically chaotic, not orderly. Passengers rush and push. Queuing would be unrealistic.',
    authenticAlternative: 'Bodies press against the danfo door. Elbows fly. "Oya enter!" the conductor screams. She squeezes through.',
  },
  {
    pattern: /\b(area\s*boy|agbero).*?(polite|friendly|helpful)\b/gi,
    culture: 'lagos',
    type: 'suggestion',
    issue: 'Area boy characterization',
    explanation: 'Area boys can be complex characters - they\'re not all menacing, but portraying them as simply polite may feel inauthentic.',
    authenticAlternative: 'Give nuance: they may help for a fee, show unexpected honor codes, or have neighborhood loyalties.',
  },

  // GENERAL NIGERIAN
  {
    pattern: /\b(shake\s*hands?).*?(left\s*hand)\b/gi,
    culture: 'general-nigerian',
    type: 'correction',
    issue: 'Left hand handshake',
    explanation: 'In Nigerian culture (and most of Africa), the left hand is considered unclean. Handshakes and giving/receiving should use the right hand.',
    authenticAlternative: 'He extends his right hand firmly.',
  },
  {
    pattern: /\b(food|eat).*?(left\s*hand)\b/gi,
    culture: 'general-nigerian',
    type: 'correction',
    issue: 'Eating with left hand',
    explanation: 'Eating with the left hand is considered disrespectful in Nigerian culture, especially when eating communal food or in front of elders.',
    authenticAlternative: 'She scoops the eba with her right hand, molding it expertly around the egusi.',
  },
  {
    pattern: /\b(point|pointing).*?(finger)\b.*?(elder|chief|person)\b/gi,
    culture: 'general-nigerian',
    type: 'suggestion',
    issue: 'Pointing at people',
    explanation: 'Pointing directly at someone with a finger is considered rude. Gesturing with an open hand or nod of the head is preferred.',
    authenticAlternative: 'He gestures toward the chief with an open palm.',
  },
  {
    pattern: /\b(elder|chief|pastor).*?(first\s*name|by\s*name)\b/gi,
    culture: 'general-nigerian',
    type: 'info',
    issue: 'Addressing elders by first name',
    explanation: 'Elders are typically addressed with titles - Chief, Pastor, Oga, Ma, Sir, etc. Using first names directly can be disrespectful.',
    authenticAlternative: 'Add appropriate honorifics: "Chief Okonkwo," "Pastor James," "Oga Musa," "Aunty Funke."',
  },
]

/**
 * Analyze script for cultural accuracy
 */
export function analyzeCulturalContent(content: string): CulturalSummary {
  const lines = content.split('\n')
  const notes: CulturalNote[] = []
  const seenIssues = new Set<string>()

  // Track cultural element counts
  const culturalElements = {
    igbo: 0,
    yoruba: 0,
    hausa: 0,
    pidgin: 0,
    general: 0,
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()

    if (!trimmedLine) return

    for (const pattern of CULTURAL_PATTERNS) {
      if (pattern.pattern.test(trimmedLine)) {
        // Reset lastIndex for global regex
        pattern.pattern.lastIndex = 0

        // Avoid duplicate notes for same issue
        const issueKey = `${lineNumber}-${pattern.issue}`
        if (seenIssues.has(issueKey)) continue
        seenIssues.add(issueKey)

        // Track cultural element
        if (pattern.culture === 'general-nigerian' || pattern.culture === 'lagos') {
          culturalElements.general++
        } else if (pattern.culture in culturalElements) {
          culturalElements[pattern.culture as keyof typeof culturalElements]++
        }

        notes.push({
          id: nanoid(),
          type: pattern.type,
          culture: pattern.culture,
          element: trimmedLine.match(pattern.pattern)?.[0] || '',
          lineNumber,
          lineContent: trimmedLine.substring(0, 100),
          issue: pattern.issue,
          explanation: pattern.explanation,
          authenticAlternative: pattern.authenticAlternative,
        })
      }
    }
  })

  // Count by type
  const corrections = notes.filter(n => n.type === 'correction').length
  const suggestions = notes.filter(n => n.type === 'suggestion' || n.type === 'info').length

  return {
    totalNotes: notes.length,
    corrections,
    suggestions,
    culturalElements,
    notes: notes.sort((a, b) => {
      // Sort corrections first, then by line number
      const typePriority = { correction: 0, suggestion: 1, info: 2 }
      const priorityDiff = typePriority[a.type] - typePriority[b.type]
      if (priorityDiff !== 0) return priorityDiff
      return a.lineNumber - b.lineNumber
    }),
  }
}

/**
 * Get culture color
 */
export function getCultureColor(culture: CulturalNote['culture']): string {
  const colors: Record<CulturalNote['culture'], string> = {
    igbo: 'text-green-400 bg-green-900/20',
    yoruba: 'text-purple-400 bg-purple-900/20',
    hausa: 'text-amber-400 bg-amber-900/20',
    'general-nigerian': 'text-blue-400 bg-blue-900/20',
    lagos: 'text-cyan-400 bg-cyan-900/20',
    pidgin: 'text-pink-400 bg-pink-900/20',
  }
  return colors[culture]
}

/**
 * Get type icon
 */
export function getNoteTypeIcon(type: CulturalNote['type']): string {
  const icons = {
    correction: '⚠️',
    suggestion: '💡',
    info: 'ℹ️',
  }
  return icons[type]
}
