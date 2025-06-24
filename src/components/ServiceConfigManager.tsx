import { useEffect } from 'react';
import { useServiceConfig } from '../hooks/useServiceConfig';
import { useDhis2Credentials } from '../hooks/useDhis2Credentials';
import { setServerIp, setDhis2DirectMode, setAuthHeader } from '../services/dorisSyncService';

const ServiceConfigManager = () => {
  const { config } = useServiceConfig();
  const { getAuthHeader } = useDhis2Credentials();

  // Sync server IP and DHIS2 mode to all services when they change
  useEffect(() => {
    // Update the DHIS2 sync service with the current server IP
    setServerIp(config.serverIp);
    // Update DHIS2 direct mode based on tablet mode
    setDhis2DirectMode(config.useDhis2Direct);
    // Update auth header for direct DHIS2 requests
    setAuthHeader(getAuthHeader());
    console.log('ServiceConfigManager: Updated server IP:', config.serverIp, 'Direct mode:', config.useDhis2Direct);
  }, [config.serverIp, config.useDhis2Direct, getAuthHeader]);

  // This component doesn't render anything, it just manages configuration
  return null;
};

export default ServiceConfigManager; 