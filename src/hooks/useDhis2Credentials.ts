import { useState, useEffect } from 'react';

export interface Dhis2Credentials {
  username: string;
  password: string;
}

const STORAGE_KEY = 'dhis2_credentials';
const SETUP_COMPLETE_KEY = 'dhis2_setup_complete';

// Simple encryption using base64 (in production, use a proper encryption library)
const encrypt = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const decrypt = (encrypted: string): string => {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch {
    return '';
  }
};

export const useDhis2Credentials = () => {
  const [credentials, setCredentials] = useState<Dhis2Credentials | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load credentials from localStorage on mount
  useEffect(() => {
    const loadCredentials = () => {
      try {
        const setupComplete = localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
        setIsSetupComplete(setupComplete);

        if (setupComplete) {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            const decryptedCredentials = {
              username: decrypt(parsed.username || ''),
              password: decrypt(parsed.password || ''),
            };
            setCredentials(decryptedCredentials);
          }
        }
      } catch (error) {
        console.error('Failed to load DHIS2 credentials:', error);
        // If there's an error, reset the setup
        clearCredentials();
      } finally {
        setIsLoading(false);
      }
    };

    loadCredentials();
  }, []);

  // Save credentials to localStorage with encryption
  const saveCredentials = (newCredentials: Dhis2Credentials) => {
    try {
      const encryptedCredentials = {
        username: encrypt(newCredentials.username),
        password: encrypt(newCredentials.password),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedCredentials));
      localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
      
      setCredentials(newCredentials);
      setIsSetupComplete(true);
      
      console.log('DHIS2 credentials saved successfully');
    } catch (error) {
      console.error('Failed to save DHIS2 credentials:', error);
      throw new Error('Failed to save credentials');
    }
  };

  // Clear all stored credentials
  const clearCredentials = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETUP_COMPLETE_KEY);
    setCredentials(null);
    setIsSetupComplete(false);
  };

  // Test DHIS2 connection with provided credentials
  const testConnection = async (testCredentials: Dhis2Credentials): Promise<boolean> => {
    try {
      const authHeader = `Basic ${btoa(`${testCredentials.username}:${testCredentials.password}`)}`;
      
      // Test connection to DHIS2 API
      const response = await fetch('/dhis2-direct/api/me', {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('DHIS2 connection test successful:', userData.displayName || userData.name);
        return true;
      } else {
        console.error('DHIS2 connection test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('DHIS2 connection test error:', error);
      return false;
    }
  };

  // Get auth header for API requests
  const getAuthHeader = (): string | null => {
    if (!credentials) return null;
    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  };

  // Update Vite proxy headers (for dynamic credential updating)
  const updateProxyAuth = () => {
    if (credentials) {
      // This would require a more complex setup to dynamically update Vite proxy
      // For now, we'll handle auth in the request headers
      console.log('Credentials updated for proxy authentication');
    }
  };

  return {
    credentials,
    isSetupComplete,
    isLoading,
    saveCredentials,
    clearCredentials,
    testConnection,
    getAuthHeader,
    updateProxyAuth,
  };
}; 