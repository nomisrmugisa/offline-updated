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
  