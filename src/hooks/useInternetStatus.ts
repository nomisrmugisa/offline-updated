import { useEffect, useState } from 'react';

export const isInternetAvailable = async (): Promise<boolean> => {
  try {
    await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
};

export const useInternetStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const checkInternet = async () => {
    const online = await isInternetAvailable();
    setIsOnline(online);
  };

  useEffect(() => {
    checkInternet();

    const handleOnline = () => checkInternet();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      checkInternet();
    }, 2000); // Check every 2 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
