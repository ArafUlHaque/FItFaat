import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error response has the same shape:
// { success: false, error: { message, details? } }
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists`;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body is not valid JSON";
  }

  // Hide details of unexpected crashes. An ApiError we threw on purpose
  // (e.g. 503 "wger is unavailable") keeps its message, because it is safe
  // and tells the user what to do.
  if (status >= 500 && !(err instanceof ApiError)) {
    console.error(err);
    message = "Something went wrong on the server";
    details = undefined;
  }

  res.status(status).json({ success: false, error: { message, details } });
}
