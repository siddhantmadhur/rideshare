// lib/reviewApi.ts

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Simulated current user
export const fetchMockCurrentUser = async (): Promise<{ id: string; name: string }> => {
  await delay(200);
  return {
    id: 'user456', // the one who is logged in
    name: 'Current User',
  };
};

// Get average rating of the recipient
export const fetchMockAverageRating = async (): Promise<{ average_rating: number; review_count: number }> => {
  await delay(300);
  return {
    average_rating: 4,
    review_count: 3,
  };
};

// List of reviews written by reviewers (for recipient)
export const fetchMockReviews = async (): Promise<
  { reviewerId: string; rating: number; description: string; date: string }[]
> => {
  await delay(400);
  return [
    {
      reviewerId: 'user456',
      rating: 5,
      description: 'Amazing experience. Would ride again!',
      date: '2024-10-01',
    },
    {
      reviewerId: 'user789',
      rating: 4,
      description: 'Smooth and pleasant.',
      date: '2024-09-28',
    },
    {
      reviewerId: 'user999',
      rating: 3,
      description: 'Bit of a delay, but overall okay.',
      date: '2024-09-20',
    },
  ];
};

// Lookup any user profile by ID (recipient or reviewer)
export const fetchMockUserProfile = async (uid: string): Promise<{ id: string; name: string; role: string }> => {
  await delay(200);
  const mockProfiles: Record<string, { name: string; role: string }> = {
    user123: { name: 'Recipient User', role: 'driver' },
    user456: { name: 'Alice', role: 'passenger' },
    user789: { name: 'Bob', role: 'passenger' },
    user999: { name: 'Carol', role: 'passenger' },
  };
  const fallback = { name: 'Unknown', role: 'user' };
  return { id: uid, ...(mockProfiles[uid] || fallback) };
};
