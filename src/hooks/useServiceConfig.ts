import { useEffect, useState } from 'react';
import { useDeviceDetection } from './useDeviceDetection';
import { isTabletModeAllowed, getNetworkSecurityWarning } from '../utils/networkSecurity';

export interface ServiceConfig {
  icdApiUrl: string;
  proxyApiUrl: string;
  dhis2DirectUrl: string;
  serverIp: string;
  isTabletMode: boolean;
  isSecureNetwork: boolean;
  networkWarning: string | null;
  useDhis2Direct: boolean;
}

const DEFAULT_SERVER_IP = 'localhost';
const STORAGE_KEY = 'mccod_service_config';

const getApiUrls = (serverIp: string, isTabletMode: boolean = false) => {
  // Determine if we should use direct DHIS2 or proxy
  const useDhis2Direct = isTabletMode;
  
  const urls = {
    icdApiUrl: `http://${serverIp}:8382/ct`,
    proxyApiUrl: `http://${serverIp}:5001/api/`,
    dhis2DirectUrl: useDhis2Direct ? '/dhis2-direct/api' : `http://${serverIp}:5001/api`,
    useDhis2Direct,
  };
  console.log('Generated URLs for serverIp:', serverIp, 'isTabletMode:', isTabletMode, urls);
  return urls;
};

export const useServiceConfig = () => {
  const deviceInfo = useDeviceDetection();
  const initialUrls = getApiUrls(DEFAULT_SERVER_IP, false);
  const [config, setConfig] = useState<ServiceConfig>({
    ...initialUrls,
    serverIp: DEFAULT_SERVER_IP,
    isTabletMode: false,
    isSecureNetwork: isTabletModeAllowed(),
    networkWarning: getNetworkSecurityWarning(),
  });

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        const savedIp = parsed.serverIp || DEFAULT_SERVER_IP;
        
        // Only use saved IP if we're in tablet mode, otherwise default to localhost
        const finalIp = deviceInfo.deviceType === 'tablet' || deviceInfo.deviceType === 'mobile' 
          ? savedIp 
          : DEFAULT_SERVER_IP;
          
        const urls = getApiUrls(finalIp, deviceInfo.deviceType === 'tablet' || deviceInfo.deviceType === 'mobile');
        setConfig(prev => ({
          ...prev,
          serverIp: finalIp,
          ...urls,
        }));
        
        console.log('Loaded config - Device:', deviceInfo.deviceType, 'Final IP:', finalIp);
      } catch (error) {
        console.error('Failed to parse saved service config:', error);
      }
    }
  }, [deviceInfo.deviceType]);

  // Update tablet mode based on device detection
  useEffect(() => {
    const isTabletMode = deviceInfo.deviceType === 'tablet' || deviceInfo.deviceType === 'mobile';
    console.log('=== Device Detection Update ===');
    console.log('Device type detected:', deviceInfo.deviceType);
    console.log('Is tablet mode:', isTabletMode);
    console.log('Current config before update:', config);
    
          setConfig(prev => {
        const currentIp = prev.serverIp;
        const urls = getApiUrls(currentIp, isTabletMode);
        const newConfig = {
          ...prev,
          isTabletMode,
          isSecureNetwork: isTabletModeAllowed(),
          networkWarning: getNetworkSecurityWarning(),
          // Update URLs with current IP when tablet mode changes
          ...urls,
        };
        console.log('New config after update:', newConfig);
        console.log('==============================');
        return newConfig;
      });
  }, [deviceInfo.deviceType]);

  // Function to update server IP
  const updateServerIp = (newIp: string) => {
    const normalizedIp = newIp.trim() || DEFAULT_SERVER_IP;
    const urls = getApiUrls(normalizedIp, config.isTabletMode);
    const newConfig = {
      ...urls,
      serverIp: normalizedIp,
      isTabletMode: config.isTabletMode,
      isSecureNetwork: isTabletModeAllowed(),
      networkWarning: getNetworkSecurityWarning(),
    };

    setConfig(newConfig);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      serverIp: normalizedIp,
    }));
  };

  // Function to get local network IP suggestions
  const getNetworkIpSuggestions = () => {
    // Common private network ranges
    return [
      '192.168.1.100',
      '192.168.0.100', 
      '192.168.1.1',
      '10.0.0.100',
      '172.16.0.100',
    ];
  };

  // Function to test connectivity to a specific IP
  const testConnectivity = async (ip: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`http://${ip}:8382/ct`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 200;
    } catch {
      return false;
    }
  };

  return {
    config,
    updateServerIp,
    getNetworkIpSuggestions,
    testConnectivity,
  };
}; 