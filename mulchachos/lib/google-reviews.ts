// Live Google reviews for the business, from the Places API (New).
//
// Set two environment variables in Vercel:
//
//   GOOGLE_PLACES_API_KEY  — a Google Cloud API key restricted to "Places API (New)"
//   GOOGLE_PLACE_ID        — the business's Place ID, e.g. ChIJ...
//
// Until both are set this returns null and the site shows the testimonials
// from the admin panel instead, so nothing breaks.
//
// Google's terms don't allow storing or caching review content, so this asks
// Google fresh on every page view (cache: "no-store"). Each call is billed
// under "Place Details Enterprise + Atmosphere". Cap spending with a daily
// quota in Google Cloud; when the quota runs out this returns null and the
// section quietly falls back.

export interface GoogleReview {
  author: string;
  authorUri: string | null;
  photoUri: string | null;
  rating: number;
  text: string;
  when: string; // "3 weeks ago", as Google words it
  reviewUri: string | null;
}

export interface GoogleReviewSummary {
  rating: number;
  count: number;
  mapsUri: string | null;
  reviews: GoogleReview[];
}

interface PlacesReview {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface PlacesResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
}

export async function getGoogleReviews(): Promise<GoogleReviewSummary | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          // Only what the section shows. Every field here is billed.
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      }
    );

    if (!res.ok) {
      console.error("Google reviews returned", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as PlacesResponse;

    const reviews: GoogleReview[] = (data.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "Google user",
        authorUri: r.authorAttribution?.uri ?? null,
        photoUri: r.authorAttribution?.photoUri ?? null,
        rating: Math.round(r.rating ?? 0),
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        when: r.relativePublishTimeDescription ?? "",
        reviewUri: r.googleMapsUri ?? null,
      }))
      .filter((r) => r.text.length > 0);

    if (!data.rating || reviews.length === 0) return null;

    return {
      rating: data.rating,
      count: data.userRatingCount ?? reviews.length,
      mapsUri: data.googleMapsUri ?? null,
      reviews,
    };
  } catch (err) {
    console.error("Google reviews failed:", err);
    return null;
  }
}
