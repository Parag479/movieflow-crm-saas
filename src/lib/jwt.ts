import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "movieflow-super-secret-jwt-key-2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "movieflow-super-secret-refresh-key-2026";

export interface TokenPayload {
  userId: string;
  email: string;
  companyId: string;
  roles: string[];
  distributorId?: string | null;
  assignedState?: string | null;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
