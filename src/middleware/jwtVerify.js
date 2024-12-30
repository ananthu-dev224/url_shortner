import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from `Authorization` header

  if (!token) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  try {
    // Verify the token and attach user info to the request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};