import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-emergency-call.ts';
import '@/ai/flows/analyze-selfie-compliance.ts';
import '@/ai/flows/generate-selfie-request-message.ts';