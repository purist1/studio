'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Scan } from '@/lib/types';

// The path to the JSON file that acts as our database
const dbPath = path.join(process.cwd(), 'src', 'lib', 'scans.json');

/**
 * Reads scans from the JSON file database.
 * If a userId is provided, it filters scans for that user.
 * @param userId The optional ID of the user to filter scans for.
 * @returns A promise that resolves to an array of Scan objects.
 */
export async function getScanHistory(userId?: string): Promise<Scan[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    let scans: Scan[] = JSON.parse(data);

    // If a userId is provided, filter the scans
    if (userId) {
      scans = scans.filter(scan => scan.userId === userId);
    }
    
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
    // We pass undefined to get all scans, since we're just adding a new one.
    const allScans = await getScanHistory(undefined);
    
    const scanWithMetadata: Scan = {
      ...newScan,
      id: new Date().getTime().toString(), // Simple unique ID
      timestamp: new Date().toISOString(), // ISO 8601 format
    };

    // Add the new scan to the beginning of the array
    allScans.unshift(scanWithMetadata);

    await fs.writeFile(dbPath, JSON.stringify(allScans, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to add scan to history:', error);
    throw new Error('Could not save scan to history.');
  }
}
