import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Required for AI writing assistance
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Optional configuration
  BACKEND_URL: z.string().url().optional().default('http://localhost:5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

// Validate environment variables
function validateEnv() {
  const parsed = envSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error('Environment variable validation failed:');
    console.error(parsed.error.flatten().fieldErrors);

    // In development, warn but don't crash
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Running with missing environment variables. Some features may not work.');
      return {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
        NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      };
    }

    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// Export validated environment variables
export const env = validateEnv();
