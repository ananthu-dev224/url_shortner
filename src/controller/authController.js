import { generateToken } from "../utils/createToken.js";

export const googleAuthCallback = (req, res) => {
  // User object received from Passport.js
  const user = req.user;

  if (!user) {
    return res.status(400).json({ message: "Authentication failed" });
  }

  // Create JWT payload
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  // Sign the JWT
  const token = generateToken(payload);

  // Send the token as JSON response
  res.json({ token });
};