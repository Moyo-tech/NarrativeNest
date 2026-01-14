/**
 * Application configuration.
 * Centralizes environment-based settings to avoid hardcoded values.
 */

// API Base URL - uses environment variable in production, empty string in development (uses Next.js proxy)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Individual API endpoints
export const API_ENDPOINTS = {
  // Story generation endpoints
  generateStory: `${API_BASE_URL}/api/generate-story`,
  generateTitle: `${API_BASE_URL}/api/generate-title`,
  generateTitleStream: `${API_BASE_URL}/api/generate-title/stream`,
  rewriteTitle: `${API_BASE_URL}/api/rewrite-title`,
  generateCharacters: `${API_BASE_URL}/api/generate-characters`,
  generateCharactersStream: `${API_BASE_URL}/api/generate-characters/stream`,
  continueCharacters: `${API_BASE_URL}/api/continue-characters`,
  generatePlots: `${API_BASE_URL}/api/generate-plots`,
  generatePlotsStream: `${API_BASE_URL}/api/generate-plots/stream`,
  generatePlace: `${API_BASE_URL}/api/generate-place`,
  generatePlaceStream: `${API_BASE_URL}/api/generate-place/stream`,
  generateDialogue: `${API_BASE_URL}/api/generate-dialogue`,
  generateDialogueStream: `${API_BASE_URL}/api/generate-dialogue/stream`,
  renderStory: `${API_BASE_URL}/api/renderstory`,
  renderStoryStream: `${API_BASE_URL}/api/renderstory/stream`,
  getRenderedStory: `${API_BASE_URL}/api/get-renderstory`,

  // Save/update endpoints for edited content
  saveTitle: `${API_BASE_URL}/api/save-title`,
  saveCharacters: `${API_BASE_URL}/api/save-characters`,
  savePlots: `${API_BASE_URL}/api/save-plots`,
  savePlace: `${API_BASE_URL}/api/save-place`,
  saveDialogue: `${API_BASE_URL}/api/save-dialogue`,

  // Image generation endpoints
  generatePrompts: `${API_BASE_URL}/generate-prompts`,
  generateImages: `${API_BASE_URL}/generate-images`,
  generateStoryboard: `${API_BASE_URL}/generate-storyboard`,

  // Health check
  healthz: `${API_BASE_URL}/healthz`,
} as const;

// Type for endpoint keys
export type ApiEndpoint = keyof typeof API_ENDPOINTS;
