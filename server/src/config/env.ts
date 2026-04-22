import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  jwtSecret: required("JWT_SECRET"),
  jwtIssuer: process.env.JWT_ISSUER || undefined,
  jwtAudience: process.env.JWT_AUDIENCE || undefined,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
