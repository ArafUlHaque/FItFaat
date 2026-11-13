import { ApiError } from "../../utils/ApiError.js";

// wger is a free, open exercise database (https://wger.de). No API key needed.
// Exercise data is licensed CC BY-SA, so the app must show its attribution.
const WGER_BASE_URL = "https://wger.de/api/v2";
const TIMEOUT_MS = 8000;

const UNAVAILABLE =
  "The exercise library (wger) is unavailable right now. Please try again in a few minutes.";

// GET a wger path and return the parsed JSON.
// Example: wgerGet("/exerciseinfo/", { name__search: "squat", limit: 20 })
export async function wgerGet(path, params = {}) {
  const url = new URL(WGER_BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }

  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // No internet, DNS failure, or wger took longer than TIMEOUT_MS.
    throw new ApiError(503, UNAVAILABLE);
  }

  if (response.status === 404) throw new ApiError(404, "Exercise not found");
  if (!response.ok) throw new ApiError(503, UNAVAILABLE);
  return response.json();
}
