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
  // The API is particular about searching fields with special characters.
  // Using `openfda.product_ndc` is necessary for an exact match on the dashed NDC format.
  const searchField = "openfda.product_ndc";
  const url = `https://api.fda.gov/drug/ndc.json?search=${searchField}:"${barcode}"&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`OpenFDA API request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0] as OpenFDAResult;
    }

    return null; // No results found
  } catch (error) {
    console.error("An error occurred while fetching data from OpenFDA:", error);
    return null;
  }
}
