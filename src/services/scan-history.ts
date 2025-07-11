'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Scan } from '@/lib/types';

// The path to the JSON file that acts as our database
const dbPath = path.join(process.cwd(), 'src', 'lib', 'scans.json');

/**
 * Reads all scans from the JSON file database.
 * @returns A promise that resolves to an array of Scan objects.
 */
export async function getScanHistory(): Promise<Scan[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const scans: Scan[] = JSON.parse(data);
    // Sort scans by timestamp in descending order (most recent first)
    scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return scans;
  } catch (error) {
    // If the file doesn't exist, it's not an error, just means no history yet.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read scan history:', error);
    throw new Error('Could not retrieve scan history.');
  }
}

/**
 * Adds a new scan record to the JSON file database.
 * @param newScan The scan data to add. It should not include an 'id' or 'timestamp'.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addScanToHistory(newScan: Omit<Scan, 'id' | 'timestamp'>): Promise<void> {
  try {
    const scans = await getScanHistory();
    
    const scanWithMetadata: Scan = {
      ...newScan,
      id: new Date().getTime().toString(), // Simple unique ID
      timestamp: new Date().toISOString(), // ISO 8601 format
    };

    // Add the new scan to the beginning of the array
    scans.unshift(scanWithMetadata);

    await fs.writeFile(dbPath, JSON.stringify(scans, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to add scan to history:', error);
    throw new Error('Could not save scan to history.');
  }
}
