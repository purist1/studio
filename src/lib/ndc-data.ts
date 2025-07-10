
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

export const ndcDataset: NDCRecord[] = [
    { ItemCode: '0003-4215-91', NDC11: '3421591', ProprietaryName: 'ONGLYZA', DosageForm: 'TABLET, FILM COATED', MarketingCategory: 'NDA', ApplicationNumber: 'NDA022350', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20090731', MarketingEndDate: '20170430' },
    { ItemCode: '0006-3061-03', NDC11: '6306103', ProprietaryName: 'EMEND', DosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA022023', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20170203', MarketingEndDate: '20210516' },
    { ItemCode: '0006-3069-01', NDC11: '6306901', ProprietaryName: 'PIFELTRO', DosageForm: 'TABLET, FILM COATED', MarketingCategory: 'NDA', ApplicationNumber: 'NDA210806', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20180720' },
    { ItemCode: '0006-3603-60', NDC11: '6360360', ProprietaryName: 'ISENTRESS', DosageForm: 'GRANULE, FOR SUSPENSION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA205786', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20131220' },
    { ItemCode: '0006-5369-03', NDC11: '6536903', ProprietaryName: 'SEGLUROMET', DosageForm: 'TABLET, FILM COATED', MarketingCategory: 'NDA', ApplicationNumber: 'NDA209806', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20171219' },
    { ItemCode: '0007-3372-59', NDC11: '7337259', ProprietaryName: 'COREG CR', DosageForm: 'CAPSULE, EXTENDED RELEASE', MarketingCategory: 'NDA', ApplicationNumber: 'NDA022012', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20070214', MarketingEndDate: '20110722' },
    { ItemCode: '0007-4207-11', NDC11: '7420711', ProprietaryName: 'HYCAMTIN', DosageForm: 'CAPSULE', MarketingCategory: 'NDA', ApplicationNumber: 'NDA020981', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20080916', MarketingEndDate: '20180131' },
    { ItemCode: '0009-0171-12', NDC11: '9017112', ProprietaryName: 'Micronase', DosageForm: 'TABLET', MarketingCategory: 'NDA', ApplicationNumber: 'NDA017498', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '19840501', MarketingEndDate: '20081201' },
    { ItemCode: '0009-0190-09', NDC11: '9019009', ProprietaryName: 'SOLU-MEDROL', DosageForm: 'INJECTION, POWDER, FOR SOLUTION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA011856', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '19590402', MarketingEndDate: '20121201' },
    { ItemCode: '0009-7529-02', NDC11: '9752902', ProprietaryName: 'Camptosar', DosageForm: 'INJECTION, SOLUTION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA020571', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '19960614', MarketingEndDate: '20130601' },
    { ItemCode: '0010-4251-03', NDC11: '10425103', ProprietaryName: 'Centragard', DosageForm: 'SOLUTION', MarketingCategory: 'NADA', ApplicationNumber: 'NADA141492', ProductType: 'PRESCRIPTION ANIMAL', MarketingStartDate: '20200803', MarketingEndDate: '20241216' },
    { ItemCode: '0010-9140-02', NDC11: '10914002', ProprietaryName: 'PREVICOX', DosageForm: 'TABLET, CHEWABLE', MarketingCategory: 'NADA', ApplicationNumber: 'NADA141230', ProductType: 'PRESCRIPTION ANIMAL', MarketingStartDate: '20200715' },
    { ItemCode: '0015-0506-41', NDC11: '15050641', ProprietaryName: 'CYTOXAN', DosageForm: 'INJECTION, POWDER, FOR SOLUTION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA012141', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20090601', MarketingEndDate: '20110831' },
    { ItemCode: '0019-9452-20', NDC11: '19945220', ProprietaryName: 'SODIUM IODIDE I 131', DosageForm: 'CAPSULE, GELATIN COATED', MarketingCategory: 'NDA', ApplicationNumber: 'NDA016517', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20120125', MarketingEndDate: '20170701' },
    { ItemCode: '0023-3988-10', NDC11: '23398810', ProprietaryName: 'Refresh Optive Mega-3 PF', DosageForm: 'SOLUTION/DROPS', MarketingCategory: 'OTC Monograph Drug', ApplicationNumber: 'M018', ProductType: 'HUMAN OTC DRUG', MarketingStartDate: '20250215', MarketingEndDate: '20250215' },
    { ItemCode: '0023-5301-05', NDC11: '23530105', ProprietaryName: 'Restasis MultiDose', DosageForm: 'EMULSION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA050790', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20161110' },
    { ItemCode: '0023-6147-30', NDC11: '23614730', ProprietaryName: 'RAPAFLO', DosageForm: 'CAPSULE', MarketingCategory: 'NDA', ApplicationNumber: 'NDA022206', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20090323', MarketingEndDate: '20260331' },
    { ItemCode: '0023-7915-30', NDC11: '23791530', ProprietaryName: 'ELIMITE', DosageForm: 'CREAM', MarketingCategory: 'NDA', ApplicationNumber: 'NDA019855', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '19891201', MarketingEndDate: '20091231' },
    { ItemCode: '0023-9205-03', NDC11: '23920503', ProprietaryName: 'REFRESH LIQUIGEL', DosageForm: 'GEL', MarketingCategory: 'OTC Monograph Drug', ApplicationNumber: 'M018', ProductType: 'HUMAN OTC DRUG', MarketingStartDate: '20011004', MarketingEndDate: '20200412' },
    { ItemCode: '0024-5761-02', NDC11: '24576102', ProprietaryName: 'Soliqua 100/33', DosageForm: 'INJECTION, SOLUTION', MarketingCategory: 'BLA', ApplicationNumber: 'BLA208673', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20200330' },
    { ItemCode: '0024-5869-03', NDC11: '24586903', ProprietaryName: 'TOUJEO', DosageForm: 'INJECTION, SOLUTION', MarketingCategory: 'BLA', ApplicationNumber: 'BLA206538', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20150215' },
    { ItemCode: '0029-1525-44', NDC11: '29152544', ProprietaryName: 'BACTROBAN', DosageForm: 'OINTMENT', MarketingCategory: 'NDA', ApplicationNumber: 'NDA050591', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '20000407', MarketingEndDate: '20160831' },
    { ItemCode: '0029-6571-31', NDC11: '29657131', ProprietaryName: 'TIMENTIN', DosageForm: 'INJECTION, POWDER, FOR SOLUTION', MarketingCategory: 'NDA', ApplicationNumber: 'NDA050658', ProductType: 'HUMAN PRESCRIPTION', MarketingStartDate: '19901022', MarketingEndDate: '20171115' },
];
