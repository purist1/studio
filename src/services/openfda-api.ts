/**
 * @fileOverview Service for interacting with the OpenFDA API.
 * 
 * - searchOpenFDA - A function to search for a drug by its NDC.
 * - OpenFDAResult - The type definition for a single result from the API.
 */

export interface OpenFDAResult {
  product_ndc: string;
  generic_name: string[];
  brand_name: string[];
  manufacturer_name: string[];
}

/**
 * Searches the OpenFDA drug/ndc.json endpoint for a given barcode.
 * @param barcode The drug barcode or NDC to search for.
 * @returns The first matching result from the API, or null if not found or an error occurs.
 */
export async function searchOpenFDA(barcode: string): Promise<OpenFDAResult | null> {
  // To handle both dashed and non-dashed NDCs, we try searching on two different fields.
  // 1. `product_ndc`: For non-dashed NDCs.
  // 2. `openfda.product_ndc`: For an exact match on dashed NDCs.
  const searchFields = ['product_ndc', 'openfda.product_ndc.exact'];
  
  for (const field of searchFields) {
    const url = `https://api.fda.gov/drug/ndc.json?search=${field}:"${barcode}"&limit=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Don't log an error here, as a 404 is expected if not found on the first field.
        continue;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Found a result, return it immediately.
        return data.results[0] as OpenFDAResult;
      }
    } catch (error) {
      console.error(`An error occurred while fetching data from OpenFDA using field ${field}:`, error);
      // Don't stop, try the next field.
    }
  }

  // If the loop completes without returning, no results were found on any field.
  console.log(`No OpenFDA result found for barcode: ${barcode}`);
  return null;
}
