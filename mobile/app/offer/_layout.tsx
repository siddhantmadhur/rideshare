import { Stack } from 'expo-router';
import { OfferProvider } from '../../context/OfferContext';

export default function OfferLayout() {
  return (
    <OfferProvider>
      <Stack />
    </OfferProvider>
  );
}
