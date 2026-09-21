import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_medicare_jwt_key_change_this";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getAuthUser = async (req) => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return null;
  }

  await connectDB();
  const user = await User.findById(decoded.id).select("-password");
  return user;
};
