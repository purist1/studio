import type { Scan } from './types';

export const mockScans: Scan[] = [
  {
    id: '1',
    userId: '1',
    barcode: 'VALID123456789',
    drugName: 'Paracetamol 500mg',
    manufacturer: 'Emzor',
    status: 'Verified',
    timestamp: new Date('2025-07-12T10:30:00Z'),
    isFlagged: false,
  },
  {
    id: '2',
    userId: '1',
    barcode: 'SUSPECT987654321',
    drugName: 'Amoxicillin 250mg',
    manufacturer: 'Unknown Pharma',
    status: 'Suspect',
    timestamp: new Date('2025-07-12T11:05:00Z'),
    isFlagged: true,
    reason: 'Manufacturer mismatch between GS1 and internal records.',
  },
  {
    id: '3',
    userId: '1',
    barcode: 'VALID246813579',
    drugName: 'Loratadine 10mg',
    manufacturer: 'GSK',
    status: 'Verified',
    timestamp: new Date('2025-07-11T15:00:00Z'),
    isFlagged: false,
  },
  {
    id: '4',
    userId: '1',
    barcode: 'UNKNOWN11223344',
    drugName: 'Ciprofloxacin 500mg',
    manufacturer: 'Juhel',
    status: 'Unknown',
    timestamp: new Date('2025-07-10T09:12:00Z'),
    isFlagged: false,
  },
    {
    id: '5',
    userId: '1',
    barcode: 'VALID111222333',
    drugName: 'Metformin 500mg',
    manufacturer: 'May & Baker',
    status: 'Verified',
    timestamp: new Date('2025-07-09T18:45:00Z'),
    isFlagged: false,
  },
];

export const getMockDrugDetails = (barcode: string) => {
  if (barcode.startsWith('SUSPECT')) {
    return {
      manufacturer: 'Unknown Pharma',
      productionDate: '2023-01-15',
      batchNumber: 'BT-XYZ-001',
      openFDADetails: 'No recall events found for this manufacturer.',
      gs1Details: 'GS1 Record: Manufacturer - "Legit Pharma Inc.", Batch: BT-XYZ-001, Prod Date: 2024-01-15',
      internalDatasetDetails: 'Internal Record: Expected manufacturer is "Legit Pharma Inc.". Batch number does not match expected format for this product.',
    };
  }
  if (barcode.startsWith('VALID')) {
     return {
      manufacturer: 'Emzor',
      productionDate: '2024-05-10',
      batchNumber: 'EMZ-PARA-0524-1',
      openFDADetails: 'No adverse events reported for batch EMZ-PARA-0524-1.',
      gs1Details: 'GS1 Record: Manufacturer - "Emzor", Batch: EMZ-PARA-0524-1, Prod Date: 2024-05-10',
      internalDatasetDetails: 'Internal Record: Batch EMZ-PARA-0524-1 details match. Product is authentic.',
    };
  }
  return {
      manufacturer: 'PharmaCo',
      productionDate: '2023-11-20',
      batchNumber: 'PC-CIP-1123-5',
      openFDADetails: 'Information not available in OpenFDA.',
      gs1Details: 'GS1 details not found for this barcode.',
      internalDatasetDetails: 'Barcode not found in internal dataset.',
  }
};
