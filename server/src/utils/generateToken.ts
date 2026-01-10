import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (res: Response, userId: unknown) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m", // Access token expires in 15 minutes
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "30d", // Refresh token expires in 30 days
  });

  // Set Refresh Token as HTTP-Only Cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return { token, refreshToken };
};

export default generateToken;
