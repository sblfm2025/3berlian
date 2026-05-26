import { useContext, useEffect } from 'react';
import { MobileSearchContext } from './mobileSearchContext';

export const useMobileSearch = () => useContext(MobileSearchContext);

export const useMobileSearchRegistration = (config) => {
  const context = useMobileSearch();
  const setSearchConfig = context?.setSearchConfig;

  useEffect(() => {
    if (!setSearchConfig) return undefined;

    setSearchConfig(config);
    return () => setSearchConfig(null);
  }, [config, setSearchConfig]);
};
