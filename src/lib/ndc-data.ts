

import fdaDrugs from '@/lib/data/fda-drugs.json';

export interface NDCRecord {
    ItemCode: string;
    NDC11: string;
    ProprietaryName: string;
    DosageForm: string;
    MarketingCategory: string;
    ApplicationNumber: string;
    ProductType: string;
    MarketingStartDate: string;
    MarketingEndDate?: string;
}

export const ndcDataset: NDCRecord[] = fdaDrugs;
    

    
