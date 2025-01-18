import rateLimit from "express-rate-limit";

export const delay = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  message: { error: "Too many requests. Please try again later." },
});
