import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  username: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
    subject: payload.sub,
  };
  if (env.jwtIssuer) options.issuer = env.jwtIssuer;
  if (env.jwtAudience) options.audience = env.jwtAudience;

  return jwt.sign(
    { username: payload.username, role: payload.role },
    env.jwtSecret,
    options
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const options: jwt.VerifyOptions = { algorithms: ["HS256"] };
  if (env.jwtIssuer) options.issuer = env.jwtIssuer;
  if (env.jwtAudience) options.audience = env.jwtAudience;

  const decoded = jwt.verify(token, env.jwtSecret, options) as jwt.JwtPayload & {
    username?: string;
    role?: string;
  };

  const sub = decoded.sub;
  if (!sub || typeof decoded.username !== "string" || typeof decoded.role !== "string") {
    throw new Error("Invalid token payload");
  }

  return { sub, username: decoded.username, role: decoded.role };
}
