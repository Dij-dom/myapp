import { config } from 'dotenv';
config();

import '@/ai/flows/refine-tasks-with-gemini.ts';
import '@/ai/flows/provide-targeted-suggestions.ts';