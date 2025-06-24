/**
 * Utility functions for interacting with the Doris API
 */

type DorisCodesInput = {
    code1: string;
    code2: string;
    code3: string;
    code4: string;
  };
  
  type DorisResponse = {
    code: string;
    stemCode: string;
    [key: string]: any; // For other properties that might be in the response
  };
  
  /**
   * Computes the Doris code from the provided ICD codes
   * 
   * @param codes Object containing the ICD codes entered by the user
   * @returns The Doris API response or null if no primary code provided
   */
  export const computeDoris = async (codes: DorisCodesInput): Promise<DorisResponse | null> => {
      // Basic validation
      if (!codes.code1 && !codes.code2 && !codes.code3 && !codes.code4) {
          console.log('[DorisUtils] No codes provided - skipping');
          return null;
      }
    
      console.log('[DorisUtils] Computing Doris with codes:', codes);
      
      // Build the query parameters
      const params = new URLSearchParams();
      if (codes.code1?.trim()) params.append('causeOfDeathCodeA', codes.code1.trim());
      if (codes.code2?.trim()) params.append('causeOfDeathCodeB', codes.code2.trim());
      if (codes.code3?.trim()) params.append('causeOfDeathCodeC', codes.code3.trim());
      if (codes.code4?.trim()) params.append('causeOfDeathCodeD', codes.code4.trim());
    
      // If no valid parameters, return null
      if (params.toString() === '') {
          console.log('[DorisUtils] No valid codes after trimming - skipping');
          return null;
      }
  
      const url = `https://ug.sk-engine.cloud/icd-api/icd/release/11/2024-01/doris?${params.toString()}`;
      console.log('[DorisUtils] Making request to:', url);
    
      try {
          // Make the API request with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          console.log('[DorisUtils] Initiating fetch request with timeout');
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'API-Version': 'v2',
                  'Accept-Language': 'en',
                  'Content-Type': 'application/json'
              },
              signal: controller.signal
          });
          
          // Clear the timeout since the request completed
          clearTimeout(timeoutId);
    
          // Handle non-200 responses
          if (!response.ok) {
              const errorText = await response.text().catch(() => 'Unknown error');
              console.error(`[DorisUtils] API failed with status: ${response.status}, message: ${errorText}`);
              throw new Error(`Doris API failed: ${response.status} - ${errorText}`);
          }
          
          // Parse the JSON response
          console.log('[DorisUtils] API returned success response');
          const result = await response.json();
          console.log('[DorisUtils] API response data:', result);
          
          // Validate the response has required fields
          if (!result.code) {
              console.warn('[DorisUtils] API response missing required "code" field:', result);
              return null;
          }
          
          return {
              code: result.code,
              stemCode: result.stemCode || result.code, // Use code as fallback if stemCode is missing
              ...result
          };
      } catch  {
        //   if (error.name === 'AbortError') {
              console.error('[DorisUtils] API request timed out');
              throw new Error('Doris API request timed out after 30 seconds');
        //   }
          console.error('[DorisUtils] API request failed:');
        //   throw error;
      }
  };