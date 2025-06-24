// Network security utilities for tablet mode

/**
 * Check if the current network is a private/local network
 */
export const isPrivateNetwork = (): boolean => {
  const hostname = window.location.hostname;
  
  // Check for localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  // Check for private IP ranges
  const privateRanges = [
    /^192\.168\./,         // 192.168.x.x
    /^10\./,               // 10.x.x.x
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.x.x to 172.31.x.x
    /^169\.254\./,         // Link-local
    /^fd[0-9a-f]{2}:/i,    // IPv6 private
    /^::1$/,               // IPv6 localhost
  ];
  
  return privateRanges.some(range => range.test(hostname));
};

/**
 * Get the current network type
 */
export const getNetworkType = (): 'localhost' | 'private' | 'public' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  if (isPrivateNetwork()) {
    return 'private';
  }
  
  return 'public';
};

/**
 * Security check for tablet mode - only allow on private networks
 */
export const isTabletModeAllowed = (): boolean => {
  const networkType = getNetworkType();
  return networkType === 'localhost' || networkType === 'private';
};

/**
 * Get security warning for current network
 */
export const getNetworkSecurityWarning = (): string | null => {
  const networkType = getNetworkType();
  
  switch (networkType) {
    case 'localhost':
      return null; // No warning for localhost
    case 'private':
      return 'Connected to private network - Tablet mode available';
    case 'public':
      return 'WARNING: Public network detected - Tablet mode disabled for security';
    default:
      return 'Unknown network type';
  }
};

/**
 * Validate if current host is in allowed list
 */
export const isHostAllowed = (allowedHosts: string[]): boolean => {
  const currentHost = window.location.hostname;
  return allowedHosts.includes(currentHost);
}; 