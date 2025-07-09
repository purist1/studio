'use server';

import type { FlagSuspectDrugInput } from '@/ai/flows/flag-suspect-drugs';

interface OpenFDAResult {
    product_ndc: string;
    generic_name: string;
    brand_name: string;
    openfda: {
        manufacturer_name?: string[];
    };
}

export async function getDrugDetailsFromAPI(barcode: string): Promise<Partial<FlagSuspectDrugInput>> {
    try {
        // We will assume the barcode is the product NDC for now.
        // In a real-world scenario, we'd need to parse various barcode formats (like GS1) to extract the NDC.
        const response = await fetch(`https://api.fda.gov/drug/ndc.json?search=product_ndc:"${barcode}"&limit=1`);

        if (!response.ok) {
            console.error(`OpenFDA API request failed with status ${response.status}`);
            return {
                manufacturer: 'N/A',
                productionDate: 'N/A',
                batchNumber: 'N/A',
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
                productionDate: 'N/A (Not provided by API)',
                batchNumber: 'N/A (Not provided by API)',
                openFDADetails: `Successfully found drug in OpenFDA database. Name: ${drugName}, Manufacturer: ${manufacturer}.`,
                gs1Details: 'GS1 Source not connected.',
                internalDatasetDetails: 'Internal Dataset not connected.',
            };
        } else {
            return {
                manufacturer: 'N/A',
                productionDate: 'N/A',
                batchNumber: 'N/A',
                openFDADetails: `No drug found for barcode "${barcode}" in the OpenFDA database. This could be a non-US drug, a non-prescription item, or a counterfeit product.`,
                gs1Details: 'GS1 Source not connected.',
                internalDatasetDetails: 'Internal Dataset not connected.',
            };
        }

    } catch (error) {
        console.error('Error fetching from OpenFDA:', error);
        return {
            manufacturer: 'N/A',
            productionDate: 'N/A',
            batchNumber: 'N/A',
            openFDADetails: 'An error occurred while connecting to the OpenFDA service.',
            gs1Details: 'GS1 Source not connected.',
            internalDatasetDetails: 'Internal Dataset not connected.',
        };
    }
}
