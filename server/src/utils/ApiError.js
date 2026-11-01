// Throw this from any route or service to send a clean error response.
// Example: throw new ApiError(404, "Recipe not found");
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
