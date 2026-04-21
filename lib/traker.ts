// lib/tracker.ts
export const pushToTracker = async (data: any) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_TRACKER_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        // El tracker pide obligatoriamente un token temporal
        tempSessionToken: sessionStorage.getItem('tracker_token') || "guest-session"
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error al contactar al microservicio tracker:", error);
  }
};