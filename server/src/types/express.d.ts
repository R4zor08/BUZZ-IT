import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      username: string;
      role: string;
    }

    interface Request {
      user?: UserPayload;
      jwtPayload?: JwtPayload;
      /** Set by `validateQuery` middleware after successful parse */
      validatedQuery?: unknown;
    }
  }
}

export {};
