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

export interface User {
  id: string;
  fullname: string;
  email: string;
  password?: string; // Should be hashed in a real app
}
