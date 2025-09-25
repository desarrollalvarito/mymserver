import "dotenv/config";
import jwt from "jsonwebtoken";
import { tokenBlacklist } from "./token-blacklist.helper.js";

import type { Secret } from "jsonwebtoken";

const secret: Secret = process.env.JWT_SECRET || "secret";
const secretRefresh: Secret = process.env.JWT_REFRESH_SECRET || "secret";

// Función para generar token de acceso
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, secret, { expiresIn: "5m" });
};

// Función para generar refresh token
export const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, secretRefresh, { expiresIn: "2h" });
};

// Función para verificar token de acceso
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Función para verificar refresh token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, secretRefresh);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Función para decodificar token sin verificar
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};

// Función para invalidar token agregándolo a la blacklist
export const removeToken = (token: string): void => {
  const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
  tokenBlacklist.add(actualToken);
};

// Exportar como objeto por si acaso
export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  removeToken
};