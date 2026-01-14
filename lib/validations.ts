import { z } from 'zod';

// Validation schema for writer API route
export const writerSchema = z.object({
  task: z.enum(['elaborate', 'rewrite', 'dialoguesuggestion', 'dialoguetone']).optional().default('elaborate'),
  selection: z.string().min(1, 'Selection is required').max(10000, 'Selection too long'),
  before: z.string().max(5000).optional(),
  after: z.string().max(5000).optional(),
});

// Message schema for chat
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(50000),
});

// Validation schema for writer2 API route (streaming)
export const writer2Schema = z.object({
  task: z.string().optional(),
  selection: z.string().max(10000).optional(),
  before: z.string().max(5000).optional(),
  after: z.string().max(5000).optional(),
  messages: z.array(messageSchema).min(1, 'At least one message is required').max(50),
  modelId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(1.0),
  maxTokens: z.number().min(1).max(8000).optional().default(500),
});

export type WriterInput = z.infer<typeof writerSchema>;
export type Writer2Input = z.infer<typeof writer2Schema>;
