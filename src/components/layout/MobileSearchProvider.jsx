import { useMemo, useState } from 'react';
import { MobileSearchContext } from './mobileSearchContext';

export default function MobileSearchProvider({ children }) {
  const [searchConfig, setSearchConfig] = useState(null);

  const value = useMemo(() => ({
    searchConfig,
    setSearchConfig
  }), [searchConfig]);

  return (
    <MobileSearchContext.Provider value={value}>
      {children}
    </MobileSearchContext.Provider>
  );
}
