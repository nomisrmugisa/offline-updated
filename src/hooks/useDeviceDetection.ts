import { useEffect, useState } from 'react';

export interface DeviceInfo {
  deviceType: 'laptop' | 'tablet' | 'mobile' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
  hasTouch: boolean;
  userAgent: string;
  isPortrait: boolean;
}

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceType: 'laptop',
    screenSize: { width: 0, height: 0 },
    hasTouch: false,
    userAgent: '',
    isPortrait: false,
  });

  const detectDevice = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgent = navigator.userAgent.toLowerCase();
    const isPortrait = height > width;

    // Check for URL parameter override for testing
    const urlParams = new URLSearchParams(window.location.search);
    const forceDevice = urlParams.get('device');
    if (forceDevice && ['laptop', 'tablet', 'mobile', 'desktop'].includes(forceDevice)) {
      const deviceType = forceDevice as 'laptop' | 'tablet' | 'mobile' | 'desktop';
      setDeviceInfo({
        deviceType,
        screenSize: { width, height },
        hasTouch,
        userAgent: navigator.userAgent,
        isPortrait,
      });
      return;
    }

    // Device detection logic
    let deviceType: 'laptop' | 'tablet' | 'mobile' | 'desktop' = 'laptop';

    // Check for mobile devices first (smallest screens)
    if (width <= 768) {
      deviceType = 'mobile';
    }
    // Check for tablets
    else if (width <= 1024 && hasTouch) {
      // Additional tablet detection based on user agent
      const isTablet = /ipad|android.*tablet|kindle|silk|playbook|bb10/i.test(userAgent) ||
                      (hasTouch && width >= 768 && width <= 1366);
      deviceType = isTablet ? 'tablet' : 'laptop';
    }
    // Check for desktop vs laptop
    else if (width > 1366) {
      // Large screens are typically desktops, but could be large laptops
      const isDesktop = width > 1920 || 
                       /desktop|win32|win64|wow64/i.test(userAgent) ||
                       (!hasTouch && width > 1600);
      deviceType = isDesktop ? 'desktop' : 'laptop';
    }
    // Default to laptop for medium screens without touch
    else {
      deviceType = hasTouch ? 'tablet' : 'laptop';
    }

    // Override based on specific user agent patterns
    if (/ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/iphone|android.*mobile|blackberry|windows phone/i.test(userAgent)) {
      deviceType = 'mobile';
    }

    setDeviceInfo({
      deviceType,
      screenSize: { width, height },
      hasTouch,
      userAgent: navigator.userAgent,
      isPortrait,
    });
  };

  useEffect(() => {
    // Initial detection
    detectDevice();

    // Listen for resize events to re-detect device type
    const handleResize = () => {
      detectDevice();
    };

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(detectDevice, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}; 