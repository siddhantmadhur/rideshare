import React, { createContext, useContext, useState } from 'react';

export type RideDetails = {
  passengers?: string;
  splitGas?: string;
  pickup?: string;
  dropoff?: string;
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
  const [ride, setRideState] = useState<RideDetails>({ splitGas: 'Yes'}); //default yes split gas

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
