// lib/traker.ts — legacy helper, use useInteractionTracker hook instead
export const pushToTracker = async (data: unknown) => {
  try {
    const response = await fetch("/api/tracker/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error("[Tracker] pushToTracker failed:", error)
  }
}