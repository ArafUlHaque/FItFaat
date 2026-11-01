import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modules/users/user.model.js";

// Add to any route that needs a signed-in user. Afterwards:
//   req.user   -> the signed-in user
//   req.userId -> their id as a string; use it as the owner of every record,
//                 never a userId sent in the request body.
export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Sign in required: send an Authorization: Bearer <token> header");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Token is invalid or has expired; sign in again");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "Account no longer exists");

  req.user = user;
  req.userId = user.id;
  next();
}
