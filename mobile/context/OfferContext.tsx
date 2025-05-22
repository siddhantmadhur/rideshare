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
  const [ride, setRideState] = useState<RideDetails>({ splitGas: 'Yes'}); //default yes split gas
  const [submittedRides, setSubmittedRides] = useState<RideDetails[]>([]);

  console.log('OfferContext: Current ride state:', ride); // Debug log
  console.log('OfferContext: Current submittedRides:', submittedRides); // Debug log

  const setRide = (data: Partial<RideDetails>) => {
    console.log('OfferContext: setRide called with:', data); // Debug log
    setRideState((prev) => ({ ...prev, ...data }));
  };

  const resetRide = () => {
    console.log('OfferContext: resetRide called'); // Debug log
    setRideState({ splitGas: 'Yes'});
  };

  const submitRide = () => {
    console.log('OfferContext: submitRide called!'); // Debug log
    console.log('OfferContext: Current ride being submitted:', ride); // Debug log
    setSubmittedRides((prev) => {
      const newSubmittedRides = [...prev, ride];
      console.log('OfferContext: New submittedRides array:', newSubmittedRides); // Debug log
      return newSubmittedRides;
    });
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
