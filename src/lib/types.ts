export interface Scan {
  id: string;
  userId: string;
  barcode: string;
  drugName: string | null;
  manufacturer: string | null;
  status: 'Verified' | 'Suspect' | 'Unknown';
  timestamp: string; // ISO 8601 format
  isFlagged: boolean;
  reason?: string;
}
