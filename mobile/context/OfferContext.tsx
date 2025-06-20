import React, { createContext, useContext, useState } from 'react';

interface Location {
  title: string,
  id: string,
}

export type RideDetails = {
  passengers?: string;
  hasCar?: boolean;
  splitGas?: boolean;
  splitUber?: boolean;
  pickup?: Location;
  dropoff?: Location;
  carModel?: string;
  date?: string;
  time?: string;
  environment?: string;
  notes?: string;
};

type OfferContextType = {
  ride: RideDetails;
  setRide: (data: Partial<RideDetails>) => void;
  resetRide: () => void;
};

const OfferContext = createContext<OfferContextType | null>(null);

export const OfferProvider = ({ children }: { children: React.ReactNode }) => {
  const [ride, setRideState] = useState<RideDetails>({
    hasCar: false,
    splitGas: false,
    splitUber: false,
  });

  const setRide = (data: Partial<RideDetails>) =>
    setRideState((prev) => ({ ...prev, ...data }));

  const resetRide = () => setRideState({});

  return (
    <OfferContext.Provider
      value={{ ride, setRide, resetRide }}
    >
      {children}
    </OfferContext.Provider>
  );
};

export const useOffer = () => {
  const context = useContext(OfferContext);
  if (!context) throw new Error('useOffer must be used within OfferProvider');
  return context;
};
