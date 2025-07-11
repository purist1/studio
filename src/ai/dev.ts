import { config } from 'dotenv';
config();

import '@/ai/flows/flag-suspect-drug-flow.ts';
import '@/ai/flows/detect-barcode-from-image.ts';
import '@/ai/flows/chat-with-ai-flow.ts';
