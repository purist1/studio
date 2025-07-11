'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkitxOpenAI} from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    genkitxOpenAI({apiKey: process.env.OPENAI_API_KEY}),
  ],
  logLevel: 'debug',
  model: 'googleai/gemini-2.0-flash',
});
