import jwt from "jsonwebtoken";
import { getSecrets } from "../config/secrets.js";
import { env } from "../config/env.js";

export const signJWT = (payload) => {

  const { jwtSecret } = getSecrets();

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: env.JWT_EXP,
  });

  return token;
};

export const verifyJWT = (token) => {
  const { jwtSecret } = getSecrets();

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const verifiedToken = jwt.verify(token, jwtSecret);

  return verifiedToken;
};
