// Each function returns { errors, value }. An empty errors object means valid;
// value holds the cleaned-up numbers and strings the controller should use.

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

// Turns "3" into 3. Returns null for anything that is not a whole number >= 1.
export function toPositiveInt(raw) {
  if (typeof raw === "number") return Number.isInteger(raw) && raw >= 1 ? raw : null;
  if (typeof raw !== "string" || !/^\d+$/.test(raw.trim())) return null;
  const number = Number(raw);
  return number >= 1 ? number : null;
}

// Query string of GET /api/v1/exercises
export function validateExerciseQuery(query = {}) {
  const errors = {};
  const value = { search: "", muscle: null, equipment: null, page: 1, limit: DEFAULT_LIMIT };

  if (query.search !== undefined) {
    if (typeof query.search !== "string") errors.search = "Search must be text";
    else if (query.search.trim().length > 50) errors.search = "Search must be 50 characters or fewer";
    else value.search = query.search.trim();
  }

  for (const field of ["muscle", "equipment"]) {
    if (query[field] === undefined || query[field] === "") continue;
    const id = toPositiveInt(query[field]);
    if (id === null) errors[field] = `${field} must be a wger ${field} id, e.g. 1`;
    else value[field] = id;
  }

  if (query.page !== undefined) {
    const page = toPositiveInt(query.page);
    if (page === null) errors.page = "page must be a whole number of 1 or more";
    else value.page = page;
  }

  if (query.limit !== undefined) {
    const limit = toPositiveInt(query.limit);
    if (limit === null || limit > MAX_LIMIT) errors.limit = `limit must be between 1 and ${MAX_LIMIT}`;
    else value.limit = limit;
  }

  return { errors, value };
}
