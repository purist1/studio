
'use server';

import type { FlagSuspectDrugInput } from '@/ai/flows/flag-suspect-drugs';
import { ndcDataset } from '@/lib/ndc-data';

interface OpenFDAResult {
    product_ndc: string;
    generic_name: string;
    brand_name: string;
    openfda: {
        manufacturer_name?: string[];
    };
}

async function searchOpenFDA(barcode: string): Promise<Partial<FlagSuspectDrugInput>> {
     try {
        const apiKey = process.env.OPENFDA_API_KEY;
        const searchParams = new URLSearchParams({
            search: `product_ndc:"${barcode}"`,
            limit: '1',
        });

        if (apiKey) {
            searchParams.append('api_key', apiKey);
        }

        const url = `https://api.fda.gov/drug/ndc.json?${searchParams.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`OpenFDA API request failed with status ${response.status}`);
            return {
                openFDADetails: `Failed to fetch data from OpenFDA. Status: ${response.status}`,
            };
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const drugInfo: OpenFDAResult = data.results[0];
            const manufacturer = drugInfo.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer';
            const drugName = drugInfo.brand_name || drugInfo.generic_name || 'Unknown Drug Name';

            return {
                manufacturer: manufacturer,
                openFDADetails: `Successfully found drug in OpenFDA database. Name: ${drugName}, Manufacturer: ${manufacturer}.`,
            };
        } else {
            return {
                openFDADetails: `No drug found for barcode "${barcode}" in the OpenFDA database. This could be a non-US drug, a non-prescription item, or a counterfeit product.`,
            };
        }

    } catch (error) {
        console.error('Error fetching from OpenFDA:', error);
        return {
            openFDADetails: 'An error occurred while connecting to the OpenFDA service.',
        };
    }
}

export async function getDrugDetailsFromAPI(barcode: string): Promise<Partial<FlagSuspectDrugInput>> {
    // A real-world app would parse different barcode formats (like GS1) to extract the NDC.
    // For now, we will assume the scanned barcode IS the NDC.
    
    // Step 1: Search our internal dataset first.
    // The NDC standard can be complex (e.g., 10 or 11 digits, different segments).
    // We'll perform a flexible search on ItemCode and NDC11.
    const internalRecord = ndcDataset.find(
      (record) => record.ItemCode.replace(/-/g, '') === barcode.replace(/-/g, '') || record.NDC11 === barcode
    );

    let details: Partial<FlagSuspectDrugInput> = {
        gs1Details: 'GS1 Source not connected.',
    };

    if (internalRecord) {
        details.manufacturer = internalRecord.ProprietaryName; // Using Proprietary Name as a stand-in for manufacturer
        details.productionDate = internalRecord.MarketingStartDate;
        details.batchNumber = 'N/A (Not in this dataset)';
        details.internalDatasetDetails = `Match found in internal dataset: ${internalRecord.ProprietaryName}, App No: ${internalRecord.ApplicationNumber}`;
    } else {
        details.internalDatasetDetails = `No match found for barcode "${barcode}" in the internal CUSTECH dataset.`;
    }

    // Step 2: Search OpenFDA to supplement our data.
    const openFDADetails = await searchOpenFDA(barcode);
    
    // Step 3: Combine the results.
    // Prioritize OpenFDA manufacturer if available, as it's more explicit.
    details = { ...details, ...openFDADetails };
    
    // If no manufacturer info from either source, set to N/A.
    if (!details.manufacturer) {
        details.manufacturer = 'N/A';
    }
    if (!details.productionDate) {
        details.productionDate = 'N/A';
    }
    if (!details.batchNumber) {
        details.batchNumber = 'N/A';
    }

    return details;
}
