export async function acceptRequest(id: string) {
  console.log('Accepted request with id:', id);
}

export async function declineRequest(id: string) {
  console.log('Declined request with id:', id);
}
export async function fetchRequests() {
  if (__DEV__) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_DATA;
  } else {
    const response = await fetch('https://backend.com/api/requests');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
}