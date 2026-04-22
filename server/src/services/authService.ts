import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { jwtExpiresInToMinutes } from "../utils/expiresMinutes.js";
import { env } from "../config/env.js";

export interface AuthSuccess {
  tokenType: "Bearer";
  accessToken: string;
  expiresInMinutes: number;
  username: string;
  role: string;
}

export async function register(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthSuccess> {
  const passwordHash = await hashPassword(input.password);
  let user;
  try {
    user = await prisma.user.create({
      data: {
      username: input.username,
      email: input.email,
      passwordHash,
      role: "User",
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw Object.assign(new Error("Username or email is already taken."), { status: 400 });
    }
    throw e;
  }

  const accessToken = signAccessToken({
    sub: String(user.id),
    username: user.username,
    role: user.role,
  });

  return {
    tokenType: "Bearer",
    accessToken,
    expiresInMinutes: jwtExpiresInToMinutes(env.jwtExpiresIn),
    username: user.username,
    role: user.role,
  };
}

export async function login(input: {
  username: string;
  password: string;
}): Promise<AuthSuccess> {
  const user = await prisma.user.findUnique({ where: { username: input.username } });
  if (!user) {
    throw Object.assign(new Error("Invalid username or password."), { status: 401 });
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw Object.assign(new Error("Invalid username or password."), { status: 401 });
  }

  const accessToken = signAccessToken({
    sub: String(user.id),
    username: user.username,
    role: user.role,
  });

  return {
    tokenType: "Bearer",
    accessToken,
    expiresInMinutes: jwtExpiresInToMinutes(env.jwtExpiresIn),
    username: user.username,
    role: user.role,
  };
}
