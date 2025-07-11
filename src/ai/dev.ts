import { config } from 'dotenv';
config();

import '@/ai/flows/verify-drug-flow.ts';
import '@/ai/flows/detect-barcode-from-image.ts';
import '@/ai/flows/chat-with-ai-flow.ts';
