import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../users/user.model.js";
import { validateLogin, validateRegister } from "./auth.validation.js";

function createToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// POST /api/v1/auth/register
export async function register(req, res) {
  const errors = validateRegister(req.body);
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  const email = req.body.email.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ name: req.body.name.trim(), email, passwordHash });

  res.status(201).json({ success: true, data: { user, token: createToken(user) } });
}

// POST /api/v1/auth/login
export async function login(req, res) {
  const errors = validateLogin(req.body);
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");
  // Same message for both cases so the API doesn't reveal which emails exist.
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  res.json({ success: true, data: { user, token: createToken(user) } });
}

// GET /api/v1/auth/me (requires a token)
export function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}
