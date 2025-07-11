'use server';

// This service is now used exclusively by the AI Chat tool.
// The main verification flow no longer uses these direct database lookups.
import { ndcDataset } from '@/lib/ndc-data';

interface DrugApiDetails {
    manufacturer?: string;
    productionDate?: string;
    batchNumber?: string;
    openFDADetails?: string;
    gs1Details?: string;
    internalDatasetDetails?: string;
    dailymedDetails?: string;
}


async function searchOpenFDA(barcode: string): Promise<{ openFDADetails?: string, manufacturer?: string }> {
     try {
        const apiKey = process.env.OPENFDA_API_KEY;
        const searchParams = new URLSearchParams({
            search: `openfda.product_ndc:"${barcode}"`,
            limit: '1',
        });

        if (apiKey) {
            searchParams.append('api_key', apiKey);
        }

        const url = `https://api.fda.gov/drug/label.json?${searchParams.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            return {
                openFDADetails: `Failed to fetch data from OpenFDA. Status: ${response.status}`,
            };
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const drugInfo = data.results[0];
            const manufacturer = drugInfo.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer';
            const drugName = drugInfo.openfda?.brand_name?.[0] || drugInfo.openfda?.generic_name?.[0] || 'Unknown Drug Name';

            return {
                manufacturer: manufacturer,
                openFDADetails: `Successfully found drug in OpenFDA database. Name: ${drugName}, Manufacturer: ${manufacturer}.`,
            };
        } else {
            return {
                openFDADetails: `No drug found for barcode "${barcode}" in the OpenFDA database.`,
            };
        }

    } catch (error) {
        return {
            openFDADetails: 'An error occurred while connecting to the OpenFDA service.',
        };
    }
}

async function searchDailyMed(barcode: string): Promise<{ dailymedDetails?: string }> {
    try {
        const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?ndc=${barcode}&limit=1`;
        const response = await fetch(url);

        if (!response.ok) {
             return {
                dailymedDetails: `Failed to fetch data from DailyMed. Status: ${response.status}`
            };
        }
        
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const drug = result.data[0];
            const drugName = drug.spl_product_data_elements?.[0]?.brand_name || 'Unknown Name';
            const manufacturer = drug.author || 'Unknown Manufacturer';
             return {
                dailymedDetails: `Successfully found drug in DailyMed database. Name: ${drugName}, Author/Manufacturer: ${manufacturer}.`
            };
        } else {
            return {
                dailymedDetails: `No drug found for barcode "${barcode}" in the DailyMed (NLM) database.`
            };
        }
    } catch (error) {
        return {
            dailymedDetails: 'An error occurred while connecting to the DailyMed service.'
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

export async function getDrugDetailsFromAPI(barcode: string): Promise<DrugApiDetails> {
    const cleanedBarcode = barcode.replace(/-/g, '');
    
    const internalRecord = ndcDataset.find(
      (record) => 
        record.ItemCode.replace(/-/g, '') === cleanedBarcode || 
        cleanedBarcode.includes(record.NDC11)
    );

    let details: DrugApiDetails = {
        gs1Details: 'External data source (e.g., GS1, Orca Scan) not connected. This feature requires API credentials from a provider like orcascan.com.',
    };

    if (internalRecord) {
        details.manufacturer = internalRecord.ProprietaryName; 
        
        let productionDateInfo = formatDate(internalRecord.MarketingStartDate);
        let internalDetailsMessage = `Match found in internal dataset: ${internalRecord.ProprietaryName}, App No: ${internalRecord.ApplicationNumber}. Marketed since: ${productionDateInfo}.`;
        
        if (internalRecord.MarketingEndDate && new Date(formatDate(internalRecord.MarketingEndDate)) < new Date()) {
            const endDate = formatDate(internalRecord.MarketingEndDate);
            productionDateInfo += ` to ${endDate}`;
            internalDetailsMessage += ` Discontinued on: ${endDate}. WARNING: This product should no longer be in circulation.`
        }

        details.productionDate = productionDateInfo;
        details.batchNumber = 'N/A (Not in this dataset)';
        details.internalDatasetDetails = internalDetailsMessage;
    } else {
        details.internalDatasetDetails = `No match found for barcode "${barcode}" in the internal CUSTECH dataset.`;
    }

    const openFDADetails = await searchOpenFDA(barcode);
    const dailyMedDetails = await searchDailyMed(barcode);
    
    details = { ...details, ...openFDADetails, ...dailyMedDetails };
    
    if (!details.manufacturer) {
        details.manufacturer = 'N/A';
    }

    return details;
}
