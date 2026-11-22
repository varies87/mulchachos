// Meta Pixel for Preston Hollow Mulchachos. The ID is public: it ships in
// every page Meta's own snippet is pasted into.
export const META_PIXEL_ID = "2475070773020417";

type Fbq = (...args: unknown[]) => void;

/**
 * Report an event to Meta, if the pixel has loaded. Sends the event name and
 * simple, non-personal details only; never the form contents.
 */
export function track(event: string, params?: Record<string, string | number>, eventId?: string) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!fbq) return;
  // eventID lets Meta pair this with the same event sent from the server.
  if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
  else fbq("track", event, params);
}
