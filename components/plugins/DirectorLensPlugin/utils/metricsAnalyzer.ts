/**
 * Writing Metrics Analyzer
 * Computes readability, word counts, and writing statistics
 */

import type { WritingMetrics } from '../types'

export function analyzeWritingMetrics(content: string): WritingMetrics {
  // Clean content
  const cleanContent = content.trim()

  if (!cleanContent) {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      averageSentenceLength: 0,
      readabilityScore: 0,
      dialoguePercentage: 0,
      actionPercentage: 0,
      estimatedReadTime: '0 min',
    }
  }

  // Basic counts
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const characterCount = cleanContent.length

  // Sentences (split by . ! ?)
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceCount = Math.max(sentences.length, 1)

  // Paragraphs (split by double newlines)
  const paragraphs = cleanContent.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphCount = Math.max(paragraphs.length, 1)

  // Average sentence length
  const averageSentenceLength = Math.round(wordCount / sentenceCount)

  // Flesch-Kincaid Reading Ease
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const syllableCount = countSyllables(cleanContent)
  const readabilityScore = Math.round(
    Math.max(0, Math.min(100,
      206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (syllableCount / wordCount))
    ))
  )

  // Dialogue detection (lines in quotes or after character names)
  const dialogueLines = (cleanContent.match(/[""].*?[""]|^[A-Z]+:/gm) || []).length
  const totalLines = cleanContent.split('\n').filter(l => l.trim()).length
  const dialoguePercentage = Math.round((dialogueLines / Math.max(totalLines, 1)) * 100)
  const actionPercentage = 100 - dialoguePercentage

  // Estimated read time (average 200 words per minute for scripts)
  const readTimeMinutes = Math.ceil(wordCount / 200)
  const estimatedReadTime = readTimeMinutes <= 1 ? '1 min' : `${readTimeMinutes} min`

  return {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    averageSentenceLength,
    readabilityScore,
    dialoguePercentage,
    actionPercentage,
    estimatedReadTime,
  }
}

/**
 * Count syllables in text (approximate)
 */
function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/[a-z]+/g) || []
  let count = 0

  for (const word of words) {
    count += countWordSyllables(word)
  }

  return Math.max(count, 1)
}

function countWordSyllables(word: string): number {
  if (word.length <= 3) return 1

  // Remove silent e
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')

  // Count vowel groups
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

/**
 * Get readability grade level
 */
export function getReadabilityGrade(score: number): string {
  if (score >= 90) return 'Very Easy (5th grade)'
  if (score >= 80) return 'Easy (6th grade)'
  if (score >= 70) return 'Fairly Easy (7th grade)'
  if (score >= 60) return 'Standard (8th-9th grade)'
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)'
  if (score >= 30) return 'Difficult (College)'
  return 'Very Difficult (Graduate)'
}

/**
 * Get metrics summary text
 */
export function getMetricsSummary(metrics: WritingMetrics): string {
  const readabilityGrade = getReadabilityGrade(metrics.readabilityScore)

  return `
**Document Overview**
- ${metrics.wordCount.toLocaleString()} words
- ${metrics.sentenceCount.toLocaleString()} sentences
- ${metrics.paragraphCount.toLocaleString()} paragraphs
- ~${metrics.estimatedReadTime} read time

**Writing Style**
- Average sentence length: ${metrics.averageSentenceLength} words
- Readability: ${metrics.readabilityScore}/100 (${readabilityGrade})
- Dialogue: ${metrics.dialoguePercentage}%
- Action/Description: ${metrics.actionPercentage}%
`.trim()
}
