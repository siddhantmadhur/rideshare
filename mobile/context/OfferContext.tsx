import React, { createContext, useContext, useState } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export type RideDetails = {
  id?: string;
  ownerId?: string;
  startLocation?: LocationData | string;
  startLocationAddress?: string;
  endLocation?: LocationData | string;
  endLocationAddress?: string;
  time?: string;
  passengers?: string;
  splitGas?: string;
  carModel?: string;
  environment?: string;
  notes?: string;
  pickupRadius?: number;
  dropOffRadius?: number;
  combinedCost?: number;
};

type OfferContextType = {
  ride: RideDetails;
  setRide: (data: Partial<RideDetails>) => void;
  resetRide: () => void;
  submitRide: () => void;
  submittedRides: RideDetails[];
};

const OfferContext = createContext<OfferContextType | null>(null);

export const OfferProvider = ({ children }: { children: React.ReactNode }) => {
  const [ride, setRideState] = useState<RideDetails>({ splitGas: 'Yes'});
  const [submittedRides, setSubmittedRides] = useState<RideDetails[]>([]);

  const setRide = (data: Partial<RideDetails>) => {
    setRideState((prev) => ({ ...prev, ...data }));
  };

  const resetRide = () => {
    setRideState({ splitGas: 'Yes'});
  };

  const submitRide = () => {
    setSubmittedRides((prev) => [...prev, ride]);
    resetRide();
  };

  return (
    <OfferContext.Provider
      value={{ ride, setRide, resetRide, submitRide, submittedRides }}
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
