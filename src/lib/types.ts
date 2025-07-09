export interface Scan {
  id: string;
  userId: string;
  barcode: string;
  drugName: string;
  manufacturer: string;
  status: 'Verified' | 'Suspect' | 'Unknown';
  timestamp: Date;
  isFlagged: boolean;
  reason?: string;
}
