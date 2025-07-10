import { config } from 'dotenv';
config();

import '@/ai/flows/flag-suspect-drugs.ts';
import '@/ai/flows/detect-barcode-from-image.ts';
import '@/ai/flows/chat-with-ai-flow.ts';
