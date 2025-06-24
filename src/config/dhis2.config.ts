// DHIS2 Configuration
// For production, consider using environment variables or a secure configuration management system

export const DHIS2_CONFIG = {
  // DHIS2 Server URL
  baseUrl: 'https://migration-dhis.sante.gov.bf',
  
  // Authentication - Replace with your actual credentials
  // For production, use environment variables: process.env.DHIS2_USERNAME, process.env.DHIS2_PASSWORD
  auth: {
    username: 'your_dhis2_username', // Replace with actual username
    password: 'your_dhis2_password', // Replace with actual password
  },
  
  // API endpoints
  endpoints: {
    events: '/api/32/events',
    dataElements: '/api/32/dataElements',
    organisationUnits: '/api/32/organisationUnits',
  },
  
  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Request timeout (in milliseconds)
  timeout: 30000,
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000, // Initial delay in ms
    backoff: 2,  // Exponential backoff multiplier
  }
};

// Helper function to get authorization header
export const getAuthHeader = () => {
  const credentials = `${DHIS2_CONFIG.auth.username}:${DHIS2_CONFIG.auth.password}`;
  return `Basic ${btoa(credentials)}`;
};

// Helper function to get full URL
export const getDhis2Url = (endpoint: string) => {
  return `${DHIS2_CONFIG.baseUrl}${endpoint}`;
};

// Export individual values for easier use
export const { baseUrl, auth, endpoints, headers, timeout, retry } = DHIS2_CONFIG; 