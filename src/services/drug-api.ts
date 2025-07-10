
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

function formatDate(dateString: string): string {
    if (dateString.length !== 8) return dateString;
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
}

export async function getDrugDetailsFromAPI(barcode: string): Promise<Partial<FlagSuspectDrugInput>> {
    const cleanedBarcode = barcode.replace(/-/g, '');
    
    const internalRecord = ndcDataset.find(
      (record) => 
        record.ItemCode.replace(/-/g, '') === cleanedBarcode || 
        cleanedBarcode.includes(record.NDC11)
    );

    let details: Partial<FlagSuspectDrugInput> = {
        gs1Details: 'External data source (e.g., GS1, Orca Scan) not connected. This feature requires API credentials from an external provider.',
    };

    if (internalRecord) {
        details.manufacturer = internalRecord.ProprietaryName; 
        
        let productionDateInfo = formatDate(internalRecord.MarketingStartDate);
        let internalDetailsMessage = `Match found in internal dataset: ${internalRecord.ProprietaryName}, App No: ${internalRecord.ApplicationNumber}. Marketed since: ${productionDateInfo}.`;
        
        if (internalRecord.MarketingEndDate) {
            const endDate = formatDate(internalRecord.MarketingEndDate);
            productionDateInfo += ` to ${endDate}`;
            internalDetailsMessage += ` Discontinued on: ${endDate}. This product should no longer be in circulation.`
        }

        details.productionDate = productionDateInfo;
        details.batchNumber = 'N/A (Not in this dataset)';
        details.internalDatasetDetails = internalDetailsMessage;
    } else {
        details.internalDatasetDetails = `No match found for barcode "${barcode}" in the internal CUSTECH dataset.`;
    }

    const openFDADetails = await searchOpenFDA(barcode);
    
    details = { ...details, ...openFDADetails };
    
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
